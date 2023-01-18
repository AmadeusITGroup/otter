import * as core from '@actions/core';
import * as github from '@actions/github';
import * as winston from 'winston';
import {NewVersion} from '@o3r/dev-tools';

/**
 * Computes the NewVersion plug-in options from an Azure DevOps context
 *
 * @param {winston.Logger} logger instance of a winston logger
 * @param {import('@o3r/dev-tools').NewVersionOptions} customOptions any override to apply to the computed options
 */
export function gitHubVersionDefaultOptionsProvider(logger, customOptions = {}) {
  // Storing ENV variables
  const buildSourceBranch = github.context.ref;
  const buildReason = github.context.eventName;
  const authenticatedGitUrl = github.context.payload.repository.html_url;
  const buildId = `${github.context.runId}`;

  // Compute organisationName
  const organisationName = github.context.actor;


  const isPullRequest = buildReason === 'pull_request';
  // If we are on a pull request, major.minor will be extracted from the target branch
  const baseBranch = !isPullRequest ? buildSourceBranch.replace('refs/heads/', '') : process.env.GITHUB_BASE_REF.replace('refs/heads/', '');

  logger.verbose('Compute new-version options from Azure environment variables');
  logger.verbose(`-- build source branch: ${buildSourceBranch}`);
  logger.verbose(`-- build reason: ${buildReason}`);
  logger.verbose(`-- repository URL: ${authenticatedGitUrl}`);
  logger.verbose(`-- actor: ${organisationName}`);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  logger.verbose(`-- is pull request: ${isPullRequest}`);
  logger.verbose(`-- build ID: ${buildId}`);
  logger.verbose(`-- baseBranch: ${baseBranch}`);

  return {
    logger,
    authenticatedGitUrl,
    baseBranch,
    isPullRequest,
    buildId,
    ...customOptions
  };
}

async function run() {
  try {
    // Processing inputs
    const defaultBranch = core.getInput('defaultBranch');
    const defaultBranchPrereleaseName = core.getInput('defaultBranchPrereleaseName');
    const defaultBranchVersionMask = core.getInput('defaultBranchVersionMask');
    const releaseBranchRegExpInput = core.getInput('releaseBranchRegExp');
    console.log(releaseBranchRegExpInput);
    const releaseBranchRegExp = new RegExp(releaseBranchRegExpInput);
    const prPreReleaseTag = core.getInput('prPreReleaseTag', {required: true});
    const logLevel = core.getInput('logLevel') || 'verbose';

    const logger = winston.createLogger({
      level: logLevel,
      format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    });

    logger.debug(JSON.stringify(process.env, null, 2));

    try {
      const options = gitHubVersionDefaultOptionsProvider(logger, {
        defaultBranch,
        defaultBranchPrereleaseName,
        defaultBranchVersionMask,
        releaseBranchRegExp,
        prPreReleaseTag
      });
      const plugin = new NewVersion(options);

      if (!plugin.isBaseBranchSupported) {
        core.warning(`Cannot compute the version for ${options.baseBranch}`);
        return;
      }

      const newVersion = await plugin.execute();

      core.setOutput('nextVersionTag', newVersion);
      logger.info(`nextVersionTag variable has been set with ${newVersion}`);

    } catch (error) {
      logger.error('Caught an error during the plug-in execution');
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Caught an error during the plug-in execution';
      core.setFailed(errorMessage);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Caught an error during input parsing';
    core.setFailed(errorMessage);
  }
}
void run();
