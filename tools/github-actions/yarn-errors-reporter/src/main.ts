import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as core from '@actions/core';
import {
  exec,
  type ExecOptions,
  getExecOutput,
} from '@actions/exec';
import {
  getOctokit,
} from '@actions/github';

type YarnInstallOutputLine = { displayName: string; indent: string; data: string };

/** Comment to identify the report comment in the Pull Request */
const COMMENT_IDENTIFIER = '<!-- yarn report comment -->\n';

/**
 * Write comment on the Pull Request listing the Yarn errors
 * @param errors list of reported errors
 */
async function writeErrorComment(errors: YarnInstallOutputLine[]) {
  const errorContent = formatComment(errors);
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  let payload: any;
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    payload = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
    );
  }

  const issueNumber = (payload?.issue || payload?.pull_request || payload)?.number;
  const issues = issueNumber !== undefined && owner && repo && token && getOctokit(token).rest.issues;
  if (!issues) {
    core.info('No access to the GitHub API, the error will not be reported to the pull request');
    return;
  }
  const comments = await issues.listComments({ owner, repo, issue_number: issueNumber });

  const previousMessage = comments.data.find(({ body }) => body && body.startsWith(COMMENT_IDENTIFIER));
  const messageBody = COMMENT_IDENTIFIER + `:warning: Yarn detected **${errors.length} errors** during the install process.\n`
    + `
---

<details>

<summary>List of reported errors</summary>

${errorContent}

</details>
`;

  try {
    await (previousMessage
      ? issues.updateComment({ comment_id: previousMessage.id, repo, owner, body: messageBody })
      : issues.createComment({ repo, owner, body: messageBody, issue_number: issueNumber })
    );
  } catch (e: any) {
    core.warning(e);
    core.warning('Error during comment update');
  }
}

/**
 * Remove the comment containing the reporting error
 */
async function removeErrorComment() {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  let payload: any;
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    payload = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
    );
  }
  const issueNumber = (payload?.issue || payload?.pull_request || payload)?.number;
  const issues = issueNumber !== undefined && owner && repo && token && getOctokit(token).rest.issues;
  if (!issues) {
    core.info('No access to the GitHub API, the errors comment will not be detected');
    return;
  }
  const comments = (await issues.listComments({ owner, repo, issue_number: issueNumber })).data.filter(({ body }) => body && body.startsWith(COMMENT_IDENTIFIER));
  await Promise.all(comments.map(async ({ id }) => {
    try {
      await issues.deleteComment({ comment_id: id, owner, repo });
    } catch (e: any) {
      core.warning(e);
      core.warning(`Fail to remove the comment ${id}`);
    }
  }));
}

function parseYarnInstallOutput(output: string, errorCodesToReport: string[]) {
  return output.split(os.EOL)
    .map((line) => line ? JSON.parse(line) as YarnInstallOutputLine : undefined)
    .filter((line): line is YarnInstallOutputLine => !!line && errorCodesToReport.includes(line.displayName));
}

function formatConsole(output: YarnInstallOutputLine[]) {
  return output
    .map((line) => `➤ ${line.displayName} ${line.indent}${line.data}`)
    .join(os.EOL);
}

function formatComment(output: YarnInstallOutputLine[]) {
  return [
    '| Error | Description |',
    '| -- | -- |',

    ...output.map((line) => `| ${line.displayName} | ${line.data.replace(/\s/g, ' ')
      // eslint-disable-next-line no-control-regex -- use to remove ansi color char
      .replace(/\u001B\[[0-9;]+m(.+?)\u001B\[39m/g, '**$1**') // ex: "\u001B\[[0-9;]+mchokibar\u001B\[39m is listed by your project" will become "**chokidar** is listed by your project"
      // eslint-disable-next-line no-control-regex -- use to remove ansi color char
      .replace(/\u001B\[[0-9;]+m/g, '')
      .replace(/\*{4}/g, '')} |`)
  ].join('\n');
}

async function run(): Promise<void> {
  try {
    const cwd = process.env.GITHUB_WORKSPACE!;
    const reportOnFile = core.getInput('reportOnFile');
    const shouldCommentPullRequest = core.getInput('shouldCommentPullRequest', { required: true });
    const errorCodesToReport = core.getInput('errorCodesToReport').split(',').map((code) => code.trim());
    const onlyReportsIfAffected = core.getBooleanInput('onlyReportsIfAffected');

    const yarnLockPath = path.resolve(cwd, 'yarn.lock');
    const execOptions = {
      cwd,
      ignoreReturnCode: true,
      silent: true
    } satisfies ExecOptions;

    if (!fs.existsSync(yarnLockPath)) {
      core.setFailed('This action only manages yarn, it doesn\'t do anything with other package managers');
      return;
    }

    const getYarnErrors = async () => {
      const { stdout } = await getExecOutput('yarn', ['install', '--mode=skip-build', '--json'], execOptions);
      return parseYarnInstallOutput(stdout, errorCodesToReport);
    };

    let previousErrors: YarnInstallOutputLine[] = [];
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

      const hasLocalChanges = (await getExecOutput('git', ['status', '-s'], execOptions)).stdout.split('\n').length > 0;
      if (hasLocalChanges) {
        await exec('git', ['stash'], execOptions);
      }
      await exec('git', ['revert', '--no-commit', '-m', '1', 'HEAD'], execOptions);
      previousErrors = await getYarnErrors();
      await exec('git', ['reset', '--hard'], execOptions);
      if (hasLocalChanges) {
        await exec('git', ['stash', 'pop'], execOptions);
      }
    } else {
      core.warning(`Fetch depth was ${fetchDepth}, all the errors from the output will be considered as new errors`);
    }

    const errors = (await getYarnErrors()).filter((error) => !previousErrors.some((pError) => pError.data === error.data));

    if (errors.length > 0) {
      core.warning(os.EOL + formatConsole(errors), { file: reportOnFile, title: 'Errors during yarn install' });
      if (shouldCommentPullRequest) {
        await writeErrorComment(errors);
      }
    } else {
      if (shouldCommentPullRequest) {
        await removeErrorComment();
      }
      core.info('No errors found!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

void run();
