import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import * as semver from 'semver';
import {formatGitTagsOutput} from './helpers';

const promisifiedExec = promisify(exec);

/** Describes the minimal interface that a logger need to implement to be used by the Cascading plugin */
export type BaseLogger = { debug: (log: string) => void; info: (log: string) => void; warning: (log: string) => void; error: (log: string) => void };

/**
 * Options expected by the NewVersion plug-in
 */
export interface NewVersionOptions<T extends BaseLogger> {
  /** Logger, you can provide here core from @actions/core for example */
  logger: T;

  /** If the branching model supports a default branch on top of usual release branches, the branch name */
  defaultBranch?: string;

  /** Regexp of versionned branches */
  releaseBranchRegExp: RegExp;

  /**
   * How versions computed from the default branch should be named.
   *   - If empty, the branch name will be used. ex: 2.6.0-master.0
   *   - If set to 'develop' and defaultBranch is 'master', will output 2.6.0-develop.0
   */
  defaultBranchPrereleaseName?: string;

  /** Version mask to apply when computing a version for the default branch */
  defaultBranchVersionMask?: string;

  /**
   * Release branch to extract Major.Minor version from.
   * If pull request, the target branch. If not, the branch being built.
   */
  baseBranch: string;

  /** Authenticated GIT URL, used to fetch tags from the repository */
  authenticatedGitUrl: string;

  /** Whether we are computing a version for a Pull request or a branch build */
  isPullRequest: boolean;

  /** The unique identifier of the build, used to compute pull request versions */
  buildId: string;

  /**
   * To use for local testing, to tell in which folder the git commands should be executed
   */
  localGitFolder?: string;

  /**
   * Pr pre-release tag
   */
  prPreReleaseTag: string;
}

/**
 * Class responsible for computing the next version according to options and the GIT tags of the repository
 */
export class NewVersion {

  /** Is the current branch supported by the plug-in to compute a new version */
  public isBaseBranchSupported: boolean;

  /** Is the current branch the default branch declared in the options */
  public isDefaultBranch: boolean;

  /** Name of the pre-release part of versions computed from the default branch */
  public defaultBranchPrereleaseName?: string;

  constructor(private options: NewVersionOptions<BaseLogger>) {
    this.isDefaultBranch = options.defaultBranch === options.baseBranch;
    this.isBaseBranchSupported = this.isDefaultBranch || options.releaseBranchRegExp.test(options.baseBranch);
    this.defaultBranchPrereleaseName = options.defaultBranchPrereleaseName || options.defaultBranch;
  }

  /**
   * Computes the next version according to the options and the GIT tags of the repository
   */
  public async execute() {
    const versionMask = this.getVersionMask();
    const gitTags = await this.retrieveGitTags();
    const newVersion = this.computeNewVersion(gitTags, versionMask);
    if (!newVersion) {
      throw new Error('Could not compute a new version candidate.');
    }
    this.options.logger.info(`New version: ${newVersion}`);
    return newVersion;
  }

  /**
   * Performs some GIT operations in order to retrieve a list of tags
   */
  public async retrieveGitTags() {
    const fetchCommand = `git fetch --tags ${this.options.authenticatedGitUrl}`;
    this.options.logger.debug(`Executing command: ${fetchCommand}`);
    const fetchOutput = await promisifiedExec(fetchCommand, {cwd: this.options.localGitFolder});
    this.options.logger.debug(JSON.stringify(fetchOutput, null, 2));
    const gitTagCommand = 'git tag --list';
    this.options.logger.info(`Executing command: ${gitTagCommand}`);
    const tagsResult = await promisifiedExec(gitTagCommand, {cwd: this.options.localGitFolder});
    this.options.logger.debug('Git tags result:');
    this.options.logger.debug(JSON.stringify(tagsResult, null, 2));
    return formatGitTagsOutput(tagsResult.stdout);
  }

  /**
   * Returns the mask with which expected version should start.
   * - If release branch it will be the second part of the branch name: release/[3.2.0-alpha]
   * - If default branch, it will be empty by default unless a mask is explicitly given as an option (options.defaultBranchVersionMask)
   */
  public getVersionMask() {
    const branchReleaseMatches = this.options.releaseBranchRegExp.exec(this.options.baseBranch);
    if (branchReleaseMatches) {
      this.options.logger.info(JSON.stringify(branchReleaseMatches));
    }
    return this.isDefaultBranch && this.options.defaultBranchVersionMask ||
      branchReleaseMatches?.length && `${branchReleaseMatches[1]}.${branchReleaseMatches[2]}${branchReleaseMatches[3] || ''}` || '';
  }

  /**
   * Compute the next version following the version mask.
   * If your default branch is behind your release branches, the version minor will be bumped
   *
   * @param tags
   * @param versionMask
   */
  public computeNewVersion(tags: string[], versionMask: string) {
    // Sort tags in descending order and exclude next major in preparation
    let parsedSortedTags = tags
      .map((tag) => semver.parse(tag.replace('V', 'v')))
      .filter((tag): tag is semver.SemVer => !!tag && !!tag.raw.match(`^(?:v)?${versionMask}`))
      .sort((v1, v2) => semver.compare(v2, v1));

    this.options.logger.debug('Parsed and sorted tags:');
    this.options.logger.debug(JSON.stringify(parsedSortedTags));
    this.options.logger.info(`Version mask: ${versionMask}`);

    if (!this.isDefaultBranch) {
      // If release branch, we filter all versions that do not satisfy the branch name to exclude 3.6.0-alpha.2 when building branch release/3.6 for example
      parsedSortedTags = parsedSortedTags.filter((parsedTag) => semver.satisfies(parsedTag, `~${versionMask}`));
    } else {
      const releaseTags = [...this.defaultBranchPrereleaseName ? [this.defaultBranchPrereleaseName] : [], 'alpha', 'beta', 'rc'];
      parsedSortedTags = parsedSortedTags.filter((parsedTag) =>
        parsedTag.prerelease.length === 0 || releaseTags.includes(`${parsedTag.prerelease[0]}`)
      );
    }

    this.options.logger.debug('Tags after filtering:');
    this.options.logger.debug(JSON.stringify(parsedSortedTags));

    const latest = parsedSortedTags[0];
    let baseVersion: string;

    // If we're on the default branch
    if (this.isDefaultBranch) {
      if (!latest) {
        // If we couldn't find a label after filtering, create a new one using the version mask given
        baseVersion = `${semver.minVersion(versionMask)!.version}-${this.defaultBranchPrereleaseName!}.0`;
      } else if (latest.prerelease.some((releaseTag) => releaseTag === this.defaultBranchPrereleaseName)) {
        // If the latest label is a default branch label, we will simply bump it
        this.options.logger.info(`Bumping patch ${this.defaultBranchPrereleaseName || ''}`);
        baseVersion = latest.raw;
      } else {
        // If the latest label is a release, it means that we need to create a default branch tag for the next minor version
        const sanitizedLatest = latest.prerelease.length > 0 ? `${latest.major}.${latest.minor}.${latest.patch}` : latest.raw;
        baseVersion = `${semver.inc(sanitizedLatest, 'minor')!}-${this.defaultBranchPrereleaseName!}.0`;
      }
      // If we're on a release branch
    } else {
      // If we found a tag, we use it as a base. Otherwise, we create a new version using the information from the branch, eg. release/3.6.0-alpha
      // will create 3.6.0-alpha.0
      baseVersion = latest ? latest.raw : `${versionMask}.0`;
    }

    this.options.logger.info(`Latest version from tags: ${latest?.version}`);
    this.options.logger.info(`Base version computed: ${baseVersion}`);

    if (this.options.isPullRequest) {
      // If it's a pull-request build, we do not increment but instead add the 'pr' flag and build number to the version
      return `${baseVersion}${this.options.prPreReleaseTag ? '-' + this.options.prPreReleaseTag : ''}.${this.options.buildId}`;
    }
    if (!latest || this.isDefaultBranch && latest.prerelease.every((releaseTag) => releaseTag !== this.defaultBranchPrereleaseName)) {
      // If this is a new release or a new minor of a default branch, we don't bump since they are initialised as .0
      return baseVersion;
    }

    // We bump either the patch or prerelease version depending on what we have.
    return semver.inc(latest, latest.prerelease.length > 0 ? 'prerelease' : 'patch');
  }
}
