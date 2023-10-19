import { ProbotOctokit } from 'probot';
import { BaseLogger, CascadingConfiguration, CascadingPullRequestInfo, CheckConclusion, DEFAULT_CONFIGURATION } from './interfaces';
import { Cascading } from './cascading';

export interface CascadingProbotOptions {
  /** Logger to report information */
  logger: BaseLogger;
  /** Octokit instance to use to perform requests */
  octokit: InstanceType<typeof ProbotOctokit>;
  /** Targeted repository */
  repo: { owner: string; repo: string };
  /** Application ID */
  appId?: string | number;
}

/**
 * Cascading class implementation for Probot framework
 */
export class CascadingProbot extends Cascading {

  /** List of possible configuration files paths */
  public static readonly CONFIGURATION_FILES = ['.github/cascadingrc.json', '.github/.cascadingrc.json', 'cascadingrc.json', '.cascadingrc.json'];

  constructor(protected options: CascadingProbotOptions) {
    super(options.logger);
  }

  /** @inheritdoc */
  protected async loadConfiguration(currentBranch?: string) {
    this.logger.debug('Load configuration');
    let remoteConfig: Partial<CascadingConfiguration> = {};

    const configFileResponses = await Promise.all(CascadingProbot.CONFIGURATION_FILES
      .map((configFile) => this.options.octokit.repos.getContent({
        ...this.options.repo,
        path: configFile,
        ref: currentBranch && `refs/heads/${currentBranch}`
      }).catch(() => null)));

    const configFileValidResponses = configFileResponses
      .map((res) => res && !Array.isArray(res.data) && res.data || null)
      .filter((res) => !!res);

    const configFileResponse = configFileValidResponses[0];

    if (configFileValidResponses.length > 1) {
      this.logger.warn(`Several configuration files have been found (${configFileValidResponses.map((c) => c?.path).join(', ')}). The files will be ignored.`);
    } else if (!configFileResponse) {
      this.logger.warn('No remote Configuration found, the default configuration will be used');
    } else {
      try {
        const configFileResponseWithContent: { content?: string; encoding?: 'utf8' | 'utf-8' | 'base64' } = configFileResponse as unknown as any;
        const parsedConfig = configFileResponseWithContent.content && JSON.parse(Buffer.from(configFileResponseWithContent.content, configFileResponseWithContent.encoding || 'base64').toString());
        if (parsedConfig) {
          this.logger.debug(`Found configuration on ${configFileResponse.url}`);
          remoteConfig = parsedConfig;
          this.logger.debug(JSON.stringify(remoteConfig, null, 2));
        } else {
          this.logger.warn('Invalid remote configuration, the default configuration will be used');
        }
      } catch (error) {
        this.logger.warn('Failed to parse the configuration, the default configuration will be used');
        this.logger.warn(JSON.stringify(error, null, 2));
      }
    }

    const config = {
      ...DEFAULT_CONFIGURATION,
      ...remoteConfig
    };

    if (!config.defaultBranch) {
      this.logger.debug('No default branch, will be retrieve from Github');
      config.defaultBranch = (await this.options.octokit.repos.get(this.options.repo)).data.default_branch;
    }

    this.logger.debug('Configuration');
    this.logger.debug(JSON.stringify(config, null, 2));
    return config;
  }

  /** @inheritdoc */
  protected async isCascadingPullRequest(id: string | number) {
    return this.options.appId !== undefined && (await this.options.octokit.pulls.get({
      ...this.options.repo,
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      pull_number: +id
    })).data.user?.id === +this.options.appId;
  }

  /** @inheritdoc */
  protected areAllChecksPassed(_id: string | number, conclusion: CheckConclusion): Promise<boolean> {
    // no need to recheck, we trust the caller which have the information in the check_suite even
    return Promise.resolve(['neutral', 'success'].includes(conclusion || ''));
  }

  /** @inheritdoc */
  protected async mergePullRequest(id: string | number) {
    return (await this.options.octokit.pulls.merge({
      ...this.options.repo,
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      pull_number: +id
    })).data.merged;
  }

  /** @inheritdoc */
  protected async isBranchAhead(baseBranch: string, targetBranch: string) {
    this.logger.debug(`Determine if ${baseBranch} is ahead of ${targetBranch}`);
    const [base, head] = await Promise.all(
      [targetBranch, baseBranch].map((branch) =>
        this.options.octokit.repos.getBranch({
          ...this.options.repo,
          branch: `refs/heads/${branch}`
        }).then(({data}) => data.commit.sha)
      )
    );

    /* eslint-disable @typescript-eslint/naming-convention, camelcase */
    const { ahead_by, behind_by } = (await this.options.octokit.repos.compareCommits({
      ...this.options.repo,
      base,
      head
    })).data;
    this.logger.debug(`${baseBranch} is ahead by ${ahead_by} and behind by ${behind_by} compare to ${targetBranch}`);
    return ahead_by > 0;
    /* eslint-enable @typescript-eslint/naming-convention, camelcase */
  }

  /** @inheritdoc */
  protected async getBranches() {
    this.logger.debug('List remote branches');
    /* eslint-disable camelcase, @typescript-eslint/naming-convention */
    const per_page = 100;
    let pageIndex = 1;
    let getCurrentPage = true;
    const branchNames: string[] = [];
    while (getCurrentPage && pageIndex <= 20) {
      const res = await this.options.octokit.repos.listBranches({
        ...this.options.repo,
        per_page,
        page: pageIndex++
      });
      branchNames.push(...res.data.map(({ name }) => name));
      getCurrentPage = res.data.length === per_page;
    }
    return branchNames;
    /* eslint-enable camelcase, @typescript-eslint/naming-convention */
  }

  /** @inheritdoc */
  protected async createBranch(branchName: string, baseBranch: string) {
    const sha = (await this.options.octokit.repos.getBranch({
      ...this.options.repo,
      branch: `refs/heads/${baseBranch}`
    })).data.commit.sha;
    await this.options.octokit.git.createRef({
      ...this.options.repo,
      ref: `refs/heads/${branchName}`,
      sha
    });
  }

  /** @inheritdoc */
  protected async deleteBranch(branchName: string) {
    await this.options.octokit.git.deleteRef({
      ...this.options.repo,
      ref: `refs/heads/${branchName}`
    });
  }

  /** @inheritdoc */
  protected async merge(branchName: string, toBranch: string) {
    try {
      await this.options.octokit.repos.merge({
        ...this.options.repo,
        base: toBranch,
        head: branchName
      });
    } catch (error) {
      this.logger.warn(JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /** @inheritdoc */
  protected async createPullRequest(cascadingBranch: string, targetBranch: string, body: string, title: string, labels?: string[]) {
    // TODO: add auto_merge when allow by the RestAPI (cf: https://github.com/orgs/community/discussions/24719)
    const {data} = await this.options.octokit.pulls.create({
      ...this.options.repo,
      head: `refs/heads/${cascadingBranch}`,
      base: `refs/heads/${targetBranch}`,
      body,
      title
    });
    if (labels && labels.length > 0) {
      const id = data.number;
      await this.options.octokit.issues.addLabels({
        ...this.options.repo,
        // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
        issue_number: id,
        labels
      });
    }
    return {
      ...data,
      originBranchName: data.head.ref,
      isOpen: data.state === 'open',
      authorId: data.user?.id,
      id: data.number,
      context: this.retrieveContext(data.body || '')
    };
  }

  /** @inheritdoc */
  protected async updatePullRequestMessage(id: string | number, body: string, title?: string): Promise<CascadingPullRequestInfo> {
    const { data } = await this.options.octokit.pulls.update({
      ...this.options.repo,
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      pull_number: +id,
      body,
      title
    });

    return {
      ...data,
      originBranchName: data.head.ref,
      id: data.number,
      isOpen: data.state === 'open',
      context: this.retrieveContext(data.body || '')
    };
  }

  /** @inheritdoc */
  protected async getPullRequests(baseBranch?: string, targetBranch?: string) {
    return (await this.options.octokit.pulls.list(this.options.repo)).data
      .filter(({ head, base }) => (!targetBranch || base.ref === targetBranch) && (!baseBranch || head.ref === baseBranch))
      .sort((prA, prB) => (Date.parse(prA.created_at) - Date.parse(prB.created_at)))
      .map((pr): CascadingPullRequestInfo => ({
        ...pr,
        originBranchName: pr.head.ref,
        authorId: pr.user?.id,
        id: pr.number,
        mergeable: null,
        isOpen: pr.state === 'open',
        context: this.retrieveContext(pr.body || '')
      }));
  }

  /** @inheritdoc */
  protected async getPullRequestFromId(id: string | number): Promise<CascadingPullRequestInfo> {
    const { data } = await this.options.octokit.pulls.get({
      ...this.options.repo,
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      pull_number: +id
    });
    return {
      ...data,
      originBranchName: data.head.ref,
      authorId: data.user?.id,
      id: data.number,
      isOpen: data.state === 'open',
      context: this.retrieveContext(data.body || '')
    };
  }
}
