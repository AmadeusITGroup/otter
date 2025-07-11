import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as core from '@actions/core';
import {
  exec,
  getExecOutput,
} from '@actions/exec';

type YarnInstallOutputLine = { displayName: string; indent: string; data: string };

function parseYarnInstallOutput(output: string, errorCodesToReport: string[]) {
  return output.split(os.EOL)
    .map((line) => line ? JSON.parse(line) as YarnInstallOutputLine : undefined)
    .filter((line): line is YarnInstallOutputLine => !!line && errorCodesToReport.includes(line.displayName))
    .map((line) => `➤${line.displayName}: ${line.indent}${line.data}`);
}

async function run(): Promise<void> {
  try {
    const cwd = process.env.GITHUB_WORKSPACE!;
    const reportOnFile = core.getInput('reportOnFile');
    const errorCodesToReport = core.getInput('errorCodesToReport').split(',').map((code) => code.trim());
    const onlyReportsIfAffected = core.getBooleanInput('onlyReportsIfAffected');
    const yarnLockPath = path.resolve(cwd, 'yarn.lock');
    const execOptions = {
      cwd,
      ignoreReturnCode: true
    };

    if (!fs.existsSync(yarnLockPath)) {
      core.setFailed('This action only manages yarn, it doesn\'t do anything with other package managers');
      return;
    }

    const getYarnErrors = async () => {
      const { stdout } = await getExecOutput('yarn', ['install', '--mode=skip-build', '--json'], execOptions);
      return parseYarnInstallOutput(stdout, errorCodesToReport);
    };

    let previousErrors: string[] = [];
    const { stdout: fetchDepth } = await getExecOutput('git', ['rev-list', 'HEAD', '--count'], execOptions);
    if (Number.parseInt(fetchDepth, 10) > 1) {
      if (onlyReportsIfAffected) {
        const gitDiffOutput = await getExecOutput('git', ['diff', 'HEAD~1', '--quiet', '--', yarnLockPath], execOptions);
        const isYarnLockAffected = gitDiffOutput.exitCode !== 0;
        if (!isYarnLockAffected) {
          core.info('Skipping error check, `yarn.lock` was not affected by this pull-request');
          return;
        }
      }

      await exec('git', ['revert', '--no-commit', '-m', '1', 'HEAD']);
      previousErrors = await getYarnErrors();
      await exec('git', ['reset', '--hard']);
    } else {
      core.warning(`Fetch depth was ${fetchDepth}, all the errors from the output will be considered as new errors`);
    }

    const errors = (await getYarnErrors()).filter((error) => !previousErrors.includes(error));

    if (errors.length > 0) {
      core.warning(errors.join(os.EOL), { file: reportOnFile, title: 'Errors during yarn install' });
    } else {
      core.info('No errors found!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

void run();
