import * as core from '@actions/core';
import * as github from '@actions/github';
import {NewVersion} from './new-version';

async function run(): Promise<void> {
  try {
    // Processing inputs
    const defaultBranch = core.getInput('defaultBranch');
    const defaultBranchPrereleaseName = core.getInput('defaultBranchPrereleaseName');
    const defaultBranchVersionMask = core.getInput('defaultBranchVersionMask');
    const releaseBranchRegExpInput = core.getInput('releaseBranchRegExp');
    const releaseBranchRegExp = new RegExp(releaseBranchRegExpInput);
    const prPreReleaseTag = core.getInput('prPreReleaseTag', {required: true});
    core.debug('Environment variables :');
    core.debug(JSON.stringify(process.env, null, 2));

    // Storing ENV variables
    const buildSourceBranch = github.context.ref;
    const buildReason = github.context.eventName;
    const authenticatedGitUrl = github.context.payload.repository!.html_url!;
    const buildId = `${github.context.runId}`;
    const isPullRequest = buildReason === 'pull_request';
    // If we are on a pull request, major.minor will be extracted from the target branch
    const baseBranch = !isPullRequest ? buildSourceBranch.replace('refs/heads/', '') : process.env.GITHUB_BASE_REF!.replace('refs/heads/', '');

    core.info('Compute new-version options from Github environment variables');
    core.info(`-- build source branch: ${buildSourceBranch}`);
    core.info(`-- build reason: ${buildReason}`);
    core.info(`-- repository URL: ${authenticatedGitUrl}`);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    core.info(`-- is pull request: ${isPullRequest}`);
    core.info(`-- build ID: ${buildId}`);
    core.info(`-- baseBranch: ${baseBranch}`);

    try {
      const options = {
        authenticatedGitUrl,
        baseBranch,
        buildId,
        defaultBranch,
        defaultBranchPrereleaseName,
        defaultBranchVersionMask,
        isPullRequest,
        logger: core,
        releaseBranchRegExp,
        prPreReleaseTag
      };

      const plugin = new NewVersion(options);
      if (!plugin.isBaseBranchSupported) {
        core.setFailed(`Cannot compute the version for ${options.baseBranch}`);
        return;
      }
      const newVersion = await plugin.execute();
      core.setOutput('nextVersionTag', newVersion);
      core.info(`nextVersionTag variable has been set with ${newVersion}`);
    } catch (error) {
      core.error('Caught an error during the plug-in execution');
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Caught an error during the plug-in execution';
      core.setFailed(errorMessage);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Caught an error during input parsing';
    core.error(errorMessage);
    core.setFailed(errorMessage);
  }
}

void run();
