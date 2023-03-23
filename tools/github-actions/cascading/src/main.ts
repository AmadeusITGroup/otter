import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import * as github from '@actions/github';
import {inspect, promisify} from 'node:util';
import {Cascading} from './cascading';
import {exec} from 'node:child_process';

const promisifiedExec = promisify(exec);

async function run(): Promise<void> {
  try {
    // Processing options from inputs
    const noFf = core.getInput('noFf');
    const ignoredPattern = core.getInput('ignoredPattern');
    const defaultBranch = core.getInput('defaultBranch');
    const conflictsIgnoredPackages = core.getInput('conflictsIgnoredPackages')?.split(',') || [];
    const assignCommitter = core.getInput('assignCommitter');
    const token = core.getInput('token');
    const buildWorkflow = core.getInput('buildWorkflow');
    const baseBranch = github.context.ref.replace('refs/heads/', '');

    core.debug('Environment variables: ');
    core.debug(JSON.stringify(process.env, null, 2));
    core.debug('Github context: ');
    core.debug(inspect(github.context));

    if (github.context.eventName === 'pull_request') {
      core.info('Cascading plugin should be disabled on a pull request, step ignored. Please consider adding a check in your pipeline');
      return;
    }

    if (defaultBranch && defaultBranch === baseBranch) {
      core.info(`Current branch is the default branch, nothing to cascade (${baseBranch} == ${defaultBranch})`);
      return;
    }

    try {
      // Instantiate GitHub client to access API
      const githubClient = getOctokit(token);

      // Configure git
      await promisifiedExec('git config --global user.email "automatic@cascading.com"');
      await promisifiedExec('git config --global user.name "Auto cascading"');

      const cascadingPlugin = new Cascading(githubClient, github.context, {
        logger: core,
        noFf,
        defaultBranch,
        ignoredPattern,
        assignCommitter,
        conflictsIgnoredPackages,
        token,
        baseBranch,
        buildWorkflow
      });
      await cascadingPlugin.execute();
    } catch (error) {
      core.error('Caught an error during the plug-in execution');
      const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Caught an error during the plug-in execution';
      if (errorMessage.includes('pull request already exists')) {
        core.warning(errorMessage);
      } else {
        core.setFailed(errorMessage);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Caught an error during input parsing';
    core.error(errorMessage);
    core.setFailed(errorMessage);
  }
}

void run();
