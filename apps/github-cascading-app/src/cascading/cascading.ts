import {
  resolve
} from 'node:path';
import {
  renderFile
} from 'ejs';
import {
  coerce,
  compare,
  parse,
  valid
} from 'semver';
import {
  BaseLogger,
  CascadingConfiguration,
  CascadingPullRequestInfo,
  CheckConclusion,
  PullRequestContext
} from './interfaces';

/** Mark of the template to determine if the users cancelled the cascading retrigger */
export const CANCEL_RETRIGGER_CASCADING_MARK = '!cancel re-cascading!';

/** Mark of the template to determine if the users cancelled the reviewers bypass for this PR */
export const CANCEL_BYPASS_REVIEWERS_MARK = '!cancel bypass!';

/** prefix of cascading branch */
export const CASCADING_BRANCH_PREFIX = 'cascading';

/** Time (in ms) to wait before re-checking the mergeable status of a PR */
export const RETRY_MERGEAGLE_STATUS_CHECK_TIMING = 3000;

/**
 * Handles the cascading to the next branch
 */
export abstract class Cascading {
  /**
   * Load configuration
   * @param branchName remote branch name used when no local files available
   */
  protected abstract loadConfiguration(branchName?: string): Promise<CascadingConfiguration>;
  /**
   * Delete a remote branch
   * @param branchName remote branch name
   */
  protected abstract deleteBranch(branchName: string): Promise<void>;
  /**
   * Create a new local branch
   * @param branchName local branch name
   * @param baseBranch
   */
  protected abstract createBranch(branchName: string, baseBranch: string): Promise<void>;
  /**
   * Pull a given remote branch
   * @param branchName remote branch name
   * @param baseBranch
   */
  protected abstract merge(branchName: string, baseBranch: string): Promise<void>;
  /**
   * Get the repository branch list
   */
  protected abstract getBranches(): Promise<string[]>;
  /**
   * Create a pull request
   * @param cascadingBranch name of the cascading branch (pull request head)
   * @param targetBranch name of the targeted branch (pull request base)
   * @param body body of the pull request
   * @param title title of the pull request
   * @param labels list of labels to add to the created PR
   */
  protected abstract createPullRequest(cascadingBranch: string, targetBranch: string, body: string, title: string, labels?: string[]): Promise<CascadingPullRequestInfo>;
  /**
   * Update the body and title of a pull request
   * @param id pull request ID
   * @param body new pull request body
   * @param title new pull request title
   */
  protected abstract updatePullRequestMessage(id: string | number, body: string, title?: string): Promise<CascadingPullRequestInfo>;
  /**
   * Get the pull requests corresponding to the given branches
   * @param cascadingBranch head branch of the pull request
   * @param targetBranch base branch of the pull request
   */
  protected abstract getPullRequests(cascadingBranch: string, targetBranch: string): Promise<CascadingPullRequestInfo[]>;
  /**
   * Get the pull request corresponding to the given id
   * @param id pull request number
   */
  protected abstract getPullRequestFromId(id: string | number): Promise<CascadingPullRequestInfo>;
  /**
   * Determine of the pull request is a cascading pull
   * @param id ID of the pull request
   */
  protected abstract isCascadingPullRequest(id: string | number): Promise<boolean>;
  /**
   * Determine of the triggered checks of a pull request are passed
   * @param id ID of the pull request
   * @param conclusion Result of the check suite
   */
  protected abstract areAllChecksPassed(id: string | number, conclusion: CheckConclusion): Promise<boolean>;
  /**
   * Trigger the pull request merge
   * @param id ID of the pull request
   */
  protected abstract mergePullRequest(id: string | number): Promise<boolean>;
  /**
   * Determine if the base branch is ahead of the target branch
   * @param baseBranch
   * @param targetBranch
   */
  protected abstract isBranchAhead(baseBranch: string, targetBranch: string): Promise<boolean>;

  /**
   * @param logger Logger
   * @param username User name used for git commands
   * @param email Email used for git commands
   */
  constructor(public logger: BaseLogger, public username = 'Auto Cascading', public email = 'cascading@otter.com') {}

  /**
   * Parse Pull Request context from the body
   * @param content Body of the pull request
   * @returns {undefined} if the context is not found
   */
  protected retrieveContext(content: string): PullRequestContext | undefined {
    const match = content.match(/<!--\s*({.*?})\s*-->/s);
    if (!match || !match[1]) {
      this.logger.warn('Failed to parse ');
      return;
    }

    return JSON.parse(match[1]);
  }

  /**
   * Generate Pull Request body
   * @param context context of the Pull Request
   * @param pullRequest
   */
  protected generatePullRequestBody(context: PullRequestContext, pullRequest?: CascadingPullRequestInfo) {
    return renderFile(resolve(__dirname, 'templates', 'pull-request-content.ejs'), {
      ...context,
      canBeMerged: pullRequest?.mergeable ?? true,
      id: pullRequest?.id || '',
      originBranchName: pullRequest?.originBranchName || '',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CANCEL_RETRIGGER_CASCADING_MARK,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      CANCEL_BYPASS_REVIEWERS_MARK
    });
  }

  /**
   * Retrieve the ordered cascading branches from the repository full branch list
   * @param fullBranchesList full list of branches of the repository
   * @param config Cascading configuration
   */
  protected getOrderedCascadingBranches(fullBranchesList: string[], config: CascadingConfiguration) {
    const cascadingBranchesPattern = new RegExp(config.cascadingBranchesPattern);
    const versionCapturePattern = new RegExp(config.versionCapturePattern);
    const ignoredPatterns = config.ignoredPatterns.map((pattern) => new RegExp(pattern));
    this.logger.debug('Sort the full list of branches:');
    this.logger.debug(JSON.stringify(fullBranchesList, null, 2));
    const branchesToCascade = fullBranchesList
      .filter((branch) => cascadingBranchesPattern.test(branch) || branch === config.defaultBranch)
      .filter((branch) => !ignoredPatterns.some((pattern) => pattern.test(branch)))
      .map((branch) => {
        if (branch === config.defaultBranch) {
          return {
            branch,
            semver: undefined
          };
        } else {
          const version = versionCapturePattern.exec(branch)?.[1];
          if (!version) {
            return {
              branch,
              semver: null
            };
          }
          const parsedVersion = parse(version);
          return {
            branch,
            semver: parsedVersion || parse(valid(coerce(version)))
          };
        }
      })
      .filter(({ branch, semver }) => {
        if (semver === null) {
          this.logger.warn(`Failed to parse the branch ${branch}, it will be skipped from cascading`);
          return false;
        }
        return true;
      })
      .sort((branchObjectA, branchObjectB) => {
        if (!branchObjectA.semver) {
          return 1;
        } else if (!branchObjectB.semver) {
          return -1;
        }

        return compare(branchObjectA.semver, branchObjectB.semver);
      });

    this.logger.debug('Discovered following branches to cascade ' + JSON.stringify(branchesToCascade.map(({ branch }) => branch), null, 2));
    return branchesToCascade;
  }

  /**
   * Generate teh cascading branch name
   * @param baseVersion Version extracted from the base branch
   * @param targetVersion Version extracted from the target branch
   * @param configurations
   */
  protected determineCascadingBranchName(baseVersion: string, targetVersion: string, configurations: CascadingConfiguration) {
    return `${configurations.branchNamePrefix}/${baseVersion}-${targetVersion}`;
  }

  /**
   * Determine if the branch is a cascading branch created by the application
   * @param branch Name of the branch to check
   * @param configurations
   */
  protected isCascadingBranchName(branch: string, configurations: CascadingConfiguration) {
    if (!branch.startsWith(configurations.branchNamePrefix)) {
      return false;
    }

    const splitBranchName = branch.split('/');
    return splitBranchName.length === 2;
  }

  /**
   * Find the pull request open with for the given branches
   * @param baseBranch name of the base branch (head of the pull request)
   * @param targetBranch name of the target branch (base of the pull request)
   */
  protected async findOpenPullRequest(baseBranch: string, targetBranch: string) {
    const pRs = await this.getPullRequests(baseBranch, targetBranch);
    const openPr = pRs.find((pr) => pr.isOpen);
    return openPr;
  }

  /**
   * Create the Pull Request title
   * @param config
   * @param currentBranch name of the base branch
   * @param targetBranch name of the target branch (base of the pull request)
   */
  protected createPullRequestTitle(config: CascadingConfiguration, currentBranch: string, targetBranch: string) {
    return config.pullRequestTitle
      .replaceAll('$origin', currentBranch)
      .replaceAll('$target', targetBranch);
  }

  /**
   * Update the pull request message based on its context
   * @param pullRequest Pull Request object
   * @param context Context of the pull request
   */
  protected async updatePullRequestWithNewMessage(pullRequest: CascadingPullRequestInfo, context: PullRequestContext) {
    this.logger.debug(`Updating the PR ${pullRequest.id}`);
    const message = await this.generatePullRequestBody({
      ...context,
      bypassReviewers: false
    }, pullRequest);

    return this.updatePullRequestMessage(pullRequest.id, message);
  }

  /**
   * Update the pull request message if the pull request cannot be merged
   * @param pullRequest Pull Request object
   * @param context Context of the pull request
   */
  protected async updateMessageWhenNonMergeable(pullRequest: CascadingPullRequestInfo, context: PullRequestContext) {
    if (!pullRequest.mergeable) {
      // recheck if we get a status, if we get update
      if (pullRequest.mergeable === null) {
        await new Promise((res) => setTimeout(res, RETRY_MERGEAGLE_STATUS_CHECK_TIMING));
        pullRequest = await this.getPullRequestFromId(pullRequest.id);
      }
      if (pullRequest?.mergeable === false) {
        await this.updatePullRequestWithNewMessage(pullRequest, context);
      }
    }
  }

  /**
   * Add update message to the pull request body to request re-evaluation of the base branch
   * @param cascadingBranch name of the cascading branch (head of the pull request)
   * @param currentBranch name of the base branch
   * @param targetBranch name of the target branch (base of the pull request)
   * @param config
   */
  protected async addTriggerToPullRequest(cascadingBranch: string, currentBranch: string, targetBranch: string, config: CascadingConfiguration) {
    this.logger.debug(`Run trigger to cascading PR from ${cascadingBranch}`);
    const openPr = await this.findOpenPullRequest(cascadingBranch, targetBranch);

    if (openPr) {
      return this.updatePullRequestWithNewMessage(openPr, openPr.context || { bypassReviewers: config.bypassReviewers, currentBranch, targetBranch, isConflicting: false });
    } else {
      this.logger.debug(`Will recreate the branch ${cascadingBranch}`);
      try {
        await this.deleteBranch(cascadingBranch);
        await this.createBranch(cascadingBranch, currentBranch);
      } catch (error) {
        this.logger.warn(`Failed to renew the cascading branch ${cascadingBranch}`);
        this.logger.debug(JSON.stringify(error, null, 2));
      }
      return this.createPullRequestWithMessage(cascadingBranch, currentBranch, targetBranch, config, true);
    }
  }

  /**
   * Create a pull request and generate its body and title
   * @param cascadingBranch name of the cascading branch (head of the pull request)
   * @param currentBranch name of the base branch of the cascading process
   * @param targetBranch name of the branch target (base of the pull request)
   * @param config
   * @param shouldAddUpdateMessage Determine if the body of the new pull request should add the update request message
   * @param isConflicting
   */
  protected async createPullRequestWithMessage(cascadingBranch: string, currentBranch: string, targetBranch: string, config: CascadingConfiguration, isConflicting = false) {
    this.logger.debug(`Creating Pull Request ${cascadingBranch} -> ${targetBranch}`);
    const openPr = await this.findOpenPullRequest(cascadingBranch, targetBranch);
    if (openPr) {
      this.logger.warn(`Pull Request ${cascadingBranch} -> ${targetBranch} already exists. Creation will be skipped.`);
      return this.updateMessageWhenNonMergeable(openPr,
        openPr.context || { bypassReviewers: config.bypassReviewers, currentBranch, targetBranch, isConflicting: false }
      );
    }
    const title = this.createPullRequestTitle(config, currentBranch, targetBranch);
    const message = await this.generatePullRequestBody({
      bypassReviewers: config.bypassReviewers,
      currentBranch,
      isConflicting,
      targetBranch
    });
    const pr = await this.createPullRequest(cascadingBranch, targetBranch, message, title, config.labels);
    return this.updateMessageWhenNonMergeable(pr,
      pr.context || { bypassReviewers: config.bypassReviewers, currentBranch, targetBranch, isConflicting: false }
    );
  }

  protected async isAllowingBypassPullRequest(pullRequest: Pick<CascadingPullRequestInfo, 'id'>) {
    const pr = await this.getPullRequestFromId(pullRequest.id);
    const checkboxLine = pr.isOpen ? pr.body?.match(new RegExp(`^ *- .*${CANCEL_BYPASS_REVIEWERS_MARK}.*$`, 'm')) : undefined;
    return !checkboxLine?.[0]?.match(/^ *- \[x]/i);
  }

  protected isAllowingCascadingRetrigger(pullRequestBody: string | null) {
    const checkboxLine = pullRequestBody?.match(new RegExp(`^ *- .*${CANCEL_RETRIGGER_CASCADING_MARK}.*$`, 'm'));
    return !checkboxLine?.[0]?.match(/^ *- \[x]/i);
  }

  /**
   * Launch the cascading process
   * @param currentBranchName name of the branch to cascade (ex: release/8.0)
   */
  public async cascade(currentBranchName: string) {
    this.logger.debug(`Run cascading on ${currentBranchName}`);
    const config = await this.loadConfiguration(currentBranchName);

    if (!(new RegExp(config.cascadingBranchesPattern)).test(currentBranchName) && currentBranchName !== config.defaultBranch) {
      this.logger.info(`Skip cascading because the branch "${currentBranchName}" does not match "${config.cascadingBranchesPattern}"`);
      return;
    }

    const isIgnored = config.ignoredPatterns
      .map(((pattern) => new RegExp(pattern)))
      .some((pattern) => pattern.test(currentBranchName));

    if (isIgnored) {
      this.logger.info(`Skip cascading because the branch "${currentBranchName}" is ignored`);
      return;
    }

    this.logger.info('Cascading plugin execution');
    const branches = await this.getBranches();
    const cascadingBranches = this.getOrderedCascadingBranches(branches, config);
    const branchIndex = cascadingBranches.findIndex(({ branch }) => branch === currentBranchName);

    if (branchIndex < 0) {
      this.logger.error(`The branch ${currentBranchName} is not part of the list of cascading branch. The process will stop.`);
      return;
    }

    if (branchIndex === cascadingBranches.length - 1) {
      this.logger.info(`The branch ${currentBranchName} is the last branch of the cascading. The process will stop.`);
      return;
    }

    const currentBranch = cascadingBranches[branchIndex];
    const targetBranch = cascadingBranches[branchIndex + 1];
    const cascadingBranch = this.determineCascadingBranchName(currentBranch.semver?.format() || currentBranch.branch, targetBranch.semver?.format() || targetBranch.branch, config);
    const isAhead = await this.isBranchAhead(currentBranch.branch, targetBranch.branch);

    if (!isAhead) {
      this.logger.info(`${currentBranch.branch} is not ahead of ${targetBranch.branch}. The cascading process will be skipped`);
      return;
    }

    const isConflicting = false;
    if (branches.includes(cascadingBranch)) {
      try {
        await this.merge(currentBranch.branch, cascadingBranch);
      } catch {
        this.logger.warn(`Fail to merge ${currentBranch.branch} into ${cascadingBranch}, will retry when merged`);
        await this.addTriggerToPullRequest(cascadingBranch, currentBranch.branch, targetBranch.branch, config);
        return;
      }
    } else {
      await this.createBranch(cascadingBranch, currentBranch.branch);
    }

    await this.createPullRequestWithMessage(cascadingBranch, currentBranch.branch, targetBranch.branch, config, isConflicting);
  }

  /**
   * Determine if the pull request merged requires to re-evaluate the cascading of it's base branch
   * This is happening when the process failed to update the pull request
   * @param pullRequest Pull request merged
   * @returns base branch name
   */
  public async branchToReevaluateCascading(pullRequest: Pick<CascadingPullRequestInfo, 'id' | 'body'>) {
    if (!(await this.isCascadingPullRequest(pullRequest.id))) {
      this.logger.info(`The PR ${pullRequest.id} is not a cascading PR.`);
      return undefined;
    }
    const context = pullRequest.body && this.retrieveContext(pullRequest.body);
    if (!context || !context.isConflicting) {
      this.logger.info(`The PR ${pullRequest.id} did not report conflict, a cascading re-trigger is not required`);
      return undefined;
    }

    if (!this.isAllowingCascadingRetrigger(pullRequest.body)) {
      this.logger.info(`The retrigger of cascading is cancelled for the PR ${pullRequest.id}`);
      return undefined;
    }

    return context.currentBranch;
  }

  /**
   * Merge a cascading pull request ignoring reviewers
   * @param pullRequest Pull request to merge
   * @param headBranch cascading branch
   * @param conclusion result of the check suite
   */
  public async mergeCascadingPullRequest(pullRequest: Pick<CascadingPullRequestInfo, 'id'>, headBranch: string, conclusion: CheckConclusion) {
    const config = await this.loadConfiguration(headBranch);
    if (!config.bypassReviewers) {
      this.logger.debug(`Reviewer bypass is disabled on ${headBranch}`);
      return;
    }

    if (!await this.isCascadingPullRequest(pullRequest.id)) {
      this.logger.info(`The PR ${pullRequest.id} is not a cascading PR`);
      return;
    }

    if (!await this.areAllChecksPassed(pullRequest.id, conclusion)) {
      this.logger.warn(`The checks of the PR ${pullRequest.id} are not passed. The merge will be skipped`);
      return;
    }

    if (!await this.isAllowingBypassPullRequest(pullRequest)) {
      this.logger.info(`The PR ${pullRequest.id} is not allowing bypass. The merge will be skipped`);
      return;
    }

    const merged = await this.mergePullRequest(pullRequest.id);
    if (!merged) {
      this.logger.error(`Failed to merge the PR ${pullRequest.id}`);
    }
  }
}
