import {
  execFileSync,
  ExecFileSyncOptionsWithStringEncoding,
  execSync,
} from 'node:child_process';

/**
 * Setup git and initial commit
 * @param workingDirectory
 */
export function setupGit(workingDirectory?: string) {
  const authorName = 'otter it tests';
  const authorEmail = 'fake-email@it-tests.otter';
  execSync('git init -b master && git add -A && git commit --allow-empty -m "initial commit" && git tag -a after-init -m "after-init"', {
    cwd: workingDirectory,
    env: {
      GIT_AUTHOR_NAME: authorName,
      GIT_COMMITTER_NAME: authorName,
      GIT_AUTHOR_EMAIL: authorEmail,
      GIT_COMMITTER_EMAIL: authorEmail
    }
  });
}

const extractFile = (line: string) => line.replace(/^[ADM]\s*/, '');
const cleanList = (list: string[]) => [...new Set(list.filter((file) => !!file).map((filePath) => filePath.replace(/[/\\]+/g, '/')))];

/**
 * Get all files added, modified or deleted based on baseBranch param
 * @param workingDirectory
 * @param baseBranch
 */
export function getGitDiff(workingDirectory?: string, baseBranch = 'after-init') {
  const execOptions: ExecFileSyncOptionsWithStringEncoding = { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8', cwd: workingDirectory };
  const untrackedFiles = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], execOptions).split('\n');
  const trackedFiles = execFileSync('git', ['diff', '--name-status', baseBranch], execOptions).split('\n');
  const indexedFiles = execFileSync('git', ['diff', '--cached', '--name-status', baseBranch], execOptions).split('\n');
  const added = cleanList([...untrackedFiles, ...[...trackedFiles, ...indexedFiles].filter((line) => line.startsWith('A')).map((line) => extractFile(line))]);
  const modified = cleanList([...trackedFiles, ...indexedFiles].filter((line) => line.startsWith('M')).map((line) => extractFile(line)));
  const deleted = cleanList([...trackedFiles, ...indexedFiles].filter((line) => line.startsWith('D')).map((line) => extractFile(line)));
  return {
    added,
    modified,
    deleted,
    all: cleanList([...added, ...modified, ...deleted])
  };
}
