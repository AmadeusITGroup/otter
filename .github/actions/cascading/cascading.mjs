import * as github from '@actions/github';
import * as core from '@actions/core';
import * as winston from 'winston';
import {getOctokit} from '@actions/github';
import {Cascading} from '@o3r/dev-tools';
import {inspect, promisify} from 'util';
import {exec} from 'child_process';

const promisifiedExec = promisify(exec);

const run = async () => {
  try {
    // Processing options from inputs
    const noFf = core.getInput('noFf');
    const cascadingPattern = core.getInput('cascadingPattern');
    const defaultBranch = core.getInput('defaultBranch');
    const conflictsIgnoredPackages = core.getInput('conflictsIgnoredPackages')?.split(',') || [];
    const assignCommitter = core.getInput('assignCommitter');
    const logLevel = core.getInput('logLevel');
    const token = core.getInput('token');
    const buildWorkflow = core.getInput('buildWorkflow');
    const baseBranch = github.context.ref.replace('refs/heads/', '');

    const logger = winston.createLogger({
      level: logLevel,
      format: winston.format.simple(),
      transports: [new winston.transports.Console()]
    });
    logger.debug(`Environment variables: `);
    logger.debug(JSON.stringify(process.env, null, 2));
    logger.debug(`Github context: `);
    logger.debug(inspect(github.context));

    if (github.context.eventName === 'pull_request') {
      logger.info(`Cascading plugin should be disabled on a pull request, step ignored. Please consider adding a check in your pipeline`);
      return;
    }

    if (defaultBranch && defaultBranch === baseBranch) {
      logger.info(`Current branch is the default branch, nothing to cascade (${baseBranch} == ${defaultBranch})`)
      return;
    }

    try {
      // Instantiate GitHub client to access API
      const githubClient = await getOctokit(token);

      //Configure git
      await promisifiedExec('git config --global user.email "auto-cascading@amadeus.com"');
      await promisifiedExec('git config --global user.name "Auto cascading"');

      const cascadingPlugin = new Cascading(githubClient, github.context, {
        logger,
        noFf,
        defaultBranch,
        cascadingPattern,
        assignCommitter,
        conflictsIgnoredPackages,
        token,
        baseBranch,
        buildWorkflow
      });
      await cascadingPlugin.execute();
    } catch (error) {
      logger.error('Caught an error during the plug-in execution');
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Caught an error during the plug-in execution';
      if (errorMessage.includes('pull request already exists')) {
        core.warning(errorMessage);
      } else {
        core.setFailed(errorMessage);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Caught an error during input parsing';
    core.setFailed(errorMessage);
  }
}
void run();
