import {
  exec,
} from 'node:child_process';
import {
  promisify,
} from 'node:util';
import * as github from '@actions/github';
import * as Context from '@actions/github/lib/context';
import {
  GitHub,
} from '@actions/github/lib/utils';
import {
  extractBranchesFromGitOutput,
  extractPackageChanges,
  handlePromisifiedExecLog,
  notIgnorablePackages,
  sortBranches,
} from './helpers';

const promisifiedExec = promisify(exec);

/** Describes the minimal interface that a logger need to implement to be used by the Cascading plugin */
export type BaseLogger = { debug: (log: string) => void; info: (log: string) => void; warning: (log: string) => void; error: (log: string) => void };

/**
 * Options expected by the Cascading plug-in
 */
export interface CascadingOptions<T extends BaseLogger> {
  /** Logger, you can provide here core from @actions/core for example */
  logger: T;

  /** Force a merge commit in the cascading */
  noFf: string;

  /** Ignore the branches that match this pattern for the cascading */
  ignoredPattern: string;

  /** Whether to assign the first committer to the cascading failure PR */
  assignCommitter: string;

  /** The list of packages changes to ignore if the conflict is only about them (ex: ['@otter/common','@otter/core','@my-lib/booking-common','@my-lib/booking-components']) */
  conflictsIgnoredPackages: string[];

  /** Access token for GitHub API authentication */
  token: string;

  /** The default branch if you have one (ex: master, development), if no candidate found with the given pattern this branch will be the last one where the code will be cascaded */
  defaultBranch: string;

  /** Branch where the build is performed */
  baseBranch: string;

  /** Name of the build workflow to trigger build on cascaded branch */
  buildWorkflow: string;

}

/**
 * Handles the cascading to the next branch
 */
export class Cascading {
  /** Name of the repository */
  public repositoryName: string;

  /** Repository owner login */
  public ownerName: string;

  constructor(public githubClient: InstanceType<typeof GitHub>, public githubContext: Context.Context, public options: CascadingOptions<BaseLogger>) {
    this.ownerName = this.githubContext.payload.repository!.owner.login;
    this.repositoryName = github.context.payload.repository!.name;
    this.options.logger.info(`ownerName : ${this.ownerName}`);
    this.options.logger.info(`repositoryName : ${this.repositoryName}`);
  }

  /**
   * Launch the cascading process
   */
  public async execute() {
    this.options.logger.info('Cascading plugin execution');
    await handlePromisifiedExecLog(promisifiedExec('git config --global user.email "auto-cascading@amadeus.com"'), this.options.logger);
    await handlePromisifiedExecLog(promisifiedExec('git config --global user.name "Auto cascading"'), this.options.logger);
    await handlePromisifiedExecLog(promisifiedExec('git status'), this.options.logger);
    const branchOutput = await handlePromisifiedExecLog(promisifiedExec('git branch -al'), this.options.logger);
    let extractedBranches = extractBranchesFromGitOutput(branchOutput.stdout);
    if (this.options.ignoredPattern) {
      const ignoredPatternRegexp = new RegExp(this.options.ignoredPattern);
      extractedBranches = extractedBranches.filter((branch) => !ignoredPatternRegexp.test(branch));
    }
    this.options.logger.info(`Extracted branches from git output : ${JSON.stringify(extractedBranches)}`);
    const sortedBranches = sortBranches(extractedBranches);
    this.options.logger.info(`Extracted branches after sorting : ${JSON.stringify(sortedBranches)}`);
    const currentBranchIndex = sortedBranches.indexOf(this.options.baseBranch);
    this.options.logger.info(`Current branch index computed : ${currentBranchIndex}`);
    if (currentBranchIndex === -1) {
      this.options.logger.info('Current branch where the build is performed is not supported by the format, no cascading will be performed.');
      return;
    }
    let branchToCascade = '';
    if (currentBranchIndex + 1 === sortedBranches.length) {
      if (this.options.defaultBranch) {
        this.options.logger.info('Current branch is the last branch that matches the pattern given, cascading on default branch instead...');
        branchToCascade = this.options.defaultBranch;
      } else {
        this.options.logger.info('No branch to cascade found, no default branch given as parameter, cascading considered done');
        return;
      }
    } else {
      branchToCascade = sortedBranches[currentBranchIndex + 1];
      this.options.logger.info(`Branch candidate for the cascading found : ${branchToCascade}`);
    }

    await handlePromisifiedExecLog(promisifiedExec(`git checkout ${this.options.baseBranch}`), this.options.logger);
    await handlePromisifiedExecLog(promisifiedExec(`git checkout ${branchToCascade}`), this.options.logger);

    try {
      // Performing cascading
      await handlePromisifiedExecLog(promisifiedExec(`git merge ${this.options.noFf === 'true' ? '--no-ff' : ''} --no-edit ${this.options.baseBranch}`), this.options.logger);
    } catch (e: any) {
      // Compute the packages for which to ignore the conflict if any
      if (this.options.conflictsIgnoredPackages.length > 0) {
        this.options.logger.info('Checking if ignored packages are the only conflicts of the cascading');
        this.options.logger.info(`Packages to ignore: ${JSON.stringify(this.options.conflictsIgnoredPackages)}`);
        const cascadingError: string = e.stdout;
        this.options.logger.info(`CascadingError output:\n ${cascadingError}`);
        const conflictingFileStartOfLine = 'CONFLICT (content): Merge conflict in ';
        const filesInConflict = cascadingError
          .split(/\r?\n\s*/)
          .filter((line) => line.startsWith(conflictingFileStartOfLine))
          .map((line) => line.split(conflictingFileStartOfLine)[1]);
        const onlyPackagesInConflict = filesInConflict.every((fileName) => fileName.endsWith('package.json') || fileName.endsWith('yarn.lock'));
        // We won't handle the use case where only the yarn lock is in conflict
        const packageJsonInConflict = filesInConflict.some((filename) => filename.endsWith('package.json'));
        this.options.logger.info(`Files in conflict: ${JSON.stringify(filesInConflict)}`);
        if (onlyPackagesInConflict && packageJsonInConflict) {
          this.options.logger.info('Conflict is only about packages, checking if we can ignore it');
          const gitDiffResultOutput = (await handlePromisifiedExecLog(promisifiedExec('git diff'), this.options.logger)).stdout;
          const changes = extractPackageChanges(gitDiffResultOutput, this.options.logger);
          const notIgnorablePackageChanges = notIgnorablePackages(changes.packageChanges, this.options.conflictsIgnoredPackages);
          if (notIgnorablePackageChanges.length > 0) {
            this.options.logger.info('Conflicts in package.json cannot be ignored');
            notIgnorablePackageChanges.forEach((fileChange) => {
              this.options.logger.info(JSON.stringify(fileChange, null, 2));
            });
            await this.createFallbackPullRequest(branchToCascade);
            return;
          } else {
            this.options.logger.info('Conflicts can be ignored, discarding those changes');
            const listOfDiscardingFiles = [...changes.packageChanges.map((file) => file.file), changes.yarnLockFile];
            for (const file of listOfDiscardingFiles) {
              if (file) {
                this.options.logger.info(`git checkout --ours ${file}`);
                await handlePromisifiedExecLog(promisifiedExec(`git checkout --ours ${file}`), this.options.logger);
              }
            }
            this.options.logger.info('We should be able to fix the conflict automatically');
            await handlePromisifiedExecLog(promisifiedExec('git add .'), this.options.logger);
            await handlePromisifiedExecLog(promisifiedExec('git status'), this.options.logger);
            await handlePromisifiedExecLog(promisifiedExec('git commit --no-edit'), this.options.logger);
            await handlePromisifiedExecLog(promisifiedExec('git status'), this.options.logger);
            this.options.logger.info('Should create a branch with completion done inside');
            const authenticatedGitUrl = this.githubContext.payload.repository!.html_url!.replace(/https:\/\/[\w-]+@/, `https://${this.ownerName}:${this.options.token}@`);
            const newCascadingBranchName = `automation/automatic-cascading-resolution-${Date.now()}`;
            await handlePromisifiedExecLog(promisifiedExec(`git push ${authenticatedGitUrl} ${branchToCascade}:${newCascadingBranchName}`), this.options.logger);
            this.options.logger.info('Creating a Pull Request with package conflict resolutions');
            await this.createFallbackPullRequest(
              branchToCascade,
              `Cascading merge failure ${this.options.baseBranch} -> ${branchToCascade} with automatic package conflict resolution`,
              `refs/heads/${newCascadingBranchName}`,
              `refs/heads/${branchToCascade}`
            );
            return;
          }
        } else {
          this.options.logger.info('Conflict is not only about packages, creating a Pull Request');
          await this.createFallbackPullRequest(branchToCascade);
          return;
        }
      } else {
        this.options.logger.error(e);
        this.options.logger.info('Automatic cascading failure, creating a Pull Request instead');
        await this.createFallbackPullRequest(branchToCascade);
        return;
      }
    }
    if (!this.githubContext.payload.repository!.html_url) {
      throw new Error('Html url not defined from the response');
    }
    try {
      await handlePromisifiedExecLog(promisifiedExec(`git push ${this.githubContext.payload.repository!.html_url} ${branchToCascade}`), this.options.logger);
    } catch (e: any) {
      const remotePushError: string = e.stdout;
      this.options.logger.warning(`Push to the remote branch failed: ${remotePushError}, creating a PR instead`);
      await this.createFallbackPullRequest(branchToCascade, 'Cascading merge without failure');
      return;
    }
    this.options.logger.info('Triggering the build on the next branch');
    const createWorkflowDispatchResponse = await this.githubClient.rest.actions.createWorkflowDispatch({
      owner: this.ownerName,
      repo: this.repositoryName,
      ref: branchToCascade,
      workflow_id: this.options.buildWorkflow
    });
    this.options.logger.debug(JSON.stringify(createWorkflowDispatchResponse, null, 2));
  }

  /**
   * Create a fallback pull request from branchToCascade to currentBranch
   * @param branchToCascade
   * @param title
   * @param baseBranchOverride
   * @param branchToCascadeOverride
   */
  public async createFallbackPullRequest(branchToCascade: string, title?: string, baseBranchOverride?: string, branchToCascadeOverride?: string) {
    // Check to use http fetch if changes are required
    const pullRequestCreationResponse = await this.githubClient.rest.pulls.create({
      owner: this.ownerName,
      repo: this.repositoryName,
      head: baseBranchOverride || this.options.baseBranch,
      base: branchToCascadeOverride || branchToCascade,
      title: title || `Cascading merge failure ${this.options.baseBranch} -> ${branchToCascade}`
    });
    this.options.logger.info('Cascading failure pull request was created');
    this.options.logger.debug(JSON.stringify(pullRequestCreationResponse, null, 2));
    if (this.options.assignCommitter === 'true') {
      this.options.logger.info('Process to assign the responsible of the failure');
      const firstMergeCommit = await this.getFirstMergeCommit(pullRequestCreationResponse.data.number);
      this.options.logger.debug(JSON.stringify(firstMergeCommit, null, 2));
      if (firstMergeCommit?.author) {
        this.options.logger.info(`Responsible of the failure is ${JSON.stringify(firstMergeCommit.author.login)}`);
        await this.assignPullRequest(pullRequestCreationResponse.data.number, firstMergeCommit.author.login);
      }
    }
  }

  /**
   * Get the first merge commit of the pull request
   * @param pullRequestNumber
   */
  public async getFirstMergeCommit(pullRequestNumber: number) {
    // Retrieve the commits from the PR to get the author of the first commit
    this.options.logger.info(`Retrieving commits of the pull request ${pullRequestNumber}`);
    const commitsResponse = await this.githubClient.rest.pulls.listCommits({
      owner: this.ownerName,
      repo: this.repositoryName,
      pull_number: pullRequestNumber
    });
    this.options.logger.debug(JSON.stringify(commitsResponse, null, 2));

    // Responsible for the merge conflict is the first person who merged his PR
    return commitsResponse.data.reverse().find((commitObject) => commitObject.commit.message.startsWith('Merged')) || commitsResponse.data.at(-1);
  }

  /**
   * Assign a pull request a user
   * @param pullRequestNumber
   * @param username
   */
  public async assignPullRequest(pullRequestNumber: number, username: string) {
    // Retrieve the commits from the PR to get the author of the first commit
    const assignPullRequestResponse = await this.githubClient.rest.issues.addAssignees({
      owner: this.ownerName,
      repo: this.repositoryName,
      issue_number: pullRequestNumber,
      assignees: [username]
    });
    this.options.logger.info(`Pull request ${pullRequestNumber} assigned to ${username}`);
    this.options.logger.debug(JSON.stringify(assignPullRequestResponse));
  }
}
