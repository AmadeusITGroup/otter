#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync, spawnSync } from 'node:child_process';
import * as url from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import * as minimist from 'minimist';

const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
const binPath = resolve(require.resolve('@angular-devkit/schematics-cli/package.json'), '../bin/schematics.js');
const args = process.argv.slice(2);
const argv = minimist(args);

let defaultPackageManager = 'npm';
if (packageManagerEnv && ['npm', 'yarn'].includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}

const packageManager: string = argv['package-manager'] || defaultPackageManager;

if (argv._.length < 2) {
  console.error('The SDK type and project name are mandatory');
  console.info(`usage: ${packageManager} create @ama-sdk typescript <@scope/package>`);
  process.exit(-1);
}

const sdkType = argv._[0];

if (sdkType !== 'typescript') {
  console.error('Only the generation of "typescript" SDK is available');
  process.exit(-2);
}

const fullPackage = argv._[1];
const packageMatch = /^(?:@([^@/]+)\/)?([^@/]+)$/.exec(fullPackage);
if (!packageMatch) {
  console.error('Invalid package name');
  process.exit(-3);
}
const [, name, pck] = packageMatch;

const targetDirectory = name ? join('.', name, pck) : join('.', pck);
const schematicsPackage = dirname(require.resolve('@ama-sdk/schematics/package.json'));

const getYarnVersion = () => {
  try {
    return execSync('yarn --version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      env: {
        ...process.env,
        //  NPM updater notifier will prevents the child process from closing until it timeout after 3 minutes.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NO_UPDATE_NOTIFIER: '1',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        NPM_CONFIG_UPDATE_NOTIFIER: 'false'
      }
    }).trim();
  } catch {
    return 'latest';
  }
};

const schematicArgs = [
  argv.debug !== undefined ? `--debug=${argv.debug as string}` : '--debug=false', // schematics enable debug mode per default when using schematics with relative path
  ...(name ? ['--name', name] : []),
  '--package', pck,
  '--package-manager', packageManager,
  ...(argv['exact-o3r-version'] ? ['--exact-o3r-version'] : []),
  ...(typeof argv['dry-run'] !== 'undefined' ? [`--${!argv['dry-run'] || argv['dry-run'] === 'false' ? 'no-' : ''}dry-run`] : []),
  ...(typeof argv['o3r-metrics'] !== 'undefined' ? [`--${!argv['o3r-metrics'] || argv['o3r-metrics'] === 'false' ? 'no-' : ''}o3r-metrics`] : [])
];

const resolveTargetDirectory = resolve(process.cwd(), targetDirectory);

const run = () => {
  const isSpecPathUrl = url.URL.canParse(argv['spec-path']);

  const runner = process.platform === 'win32' ? `${packageManager}.cmd` : packageManager;
  const steps: { args: string[]; cwd?: string; runner?: string }[] = [
    { args: [binPath, `${schematicsPackage}:typescript-shell`, ...schematicArgs, '--directory', targetDirectory] },
    ...(
      packageManager === 'yarn'
        ? [{ runner, args: ['set', 'version', getYarnVersion()], cwd: resolveTargetDirectory }]
        : []
    ),
    ...(argv['spec-path'] ? [{
      args: [
        binPath,
        `${schematicsPackage}:typescript-core`,
        ...schematicArgs,
        '--spec-path', isSpecPathUrl ? argv['spec-path'] : relative(resolveTargetDirectory, resolve(process.cwd(), argv['spec-path']))
      ],
      cwd: resolveTargetDirectory
    }] : [])
  ];

  const errors = steps
    .map((step) => spawnSync(step.runner || `"${process.execPath}"`, step.args, { stdio: 'inherit', cwd: step.cwd || process.cwd(), shell: true }))
    .filter(({error, status}) => (error || status !== 0));

  if (errors.length > 0) {
    errors.forEach(({error}) => {
      if (error) {
        console.error(error);
      }
    });
    process.exit(1);
  }
};

run();
