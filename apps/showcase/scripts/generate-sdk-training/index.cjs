/* eslint-disable no-console -- This CLI reports each command and its generated output. */
const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const version = argv['otter-version'];
const dryRun = argv['dry-run'] === true;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const repositoryRoot = resolve(__dirname, '..', '..', '..', '..');
const outputPath = join(repositoryRoot, 'apps', 'showcase', 'src', 'assets', 'trainings', 'sdk', 'shared', 'monorepo-template.json');
const extractorPath = join(repositoryRoot, 'packages', '@o3r-training', 'training-tools', 'dist', 'cli', 'extract-folder-structure', 'extract-folder-structure.cjs');

if (!version) {
  throw new Error('Missing Otter version. Run with --otter-version <version>.');
}

const temporaryRoot = dryRun ? join(tmpdir(), '<temporary-directory>') : mkdtempSync(join(tmpdir(), 'o3r-sdk-training-'));
const workspacePath = join(temporaryRoot, 'sdk-tutorial');

function run(command, commandArgs, cwd) {
  console.log(`> ${command} ${commandArgs.join(' ')}`);
  if (dryRun) {
    return;
  }
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit'
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}: ${command} ${commandArgs.join(' ')}`);
  }
}

try {
  run(npmCommand, ['create', `@o3r@${version}`, 'sdk-tutorial'], temporaryRoot);
  run(npmCommand, ['run', 'ng', '--', 'g', 'application', 'tutorial-app'], workspacePath);
  run(npmCommand, ['run', 'ng', '--', 'g', 'sdk', 'sdk-tutorial'], workspacePath);
  run(process.execPath, [
    extractorPath,
    '--root', workspacePath,
    '--files', '.',
    '--exclude', '.git,node_modules,dist,.angular,.nx,coverage',
    '--output', outputPath
  ], repositoryRoot);

  if (!dryRun) {
    const template = JSON.parse(readFileSync(outputPath, 'utf8'));
    if (!template.fileSystemTree) {
      throw new Error(`Generated template does not contain a fileSystemTree: ${outputPath}`);
    }
    console.log(`Generated ${outputPath}`);
  }
} finally {
  if (!dryRun) {
    rmSync(temporaryRoot, { force: true, recursive: true });
  }
}
