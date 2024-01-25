#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import * as minimist from 'minimist';

const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
const defaultScope = 'sdk';
const binPath = resolve(require.resolve('@angular-devkit/schematics-cli/package.json'), '../bin/schematics.js');
const args = process.argv.slice(2);
const argv = minimist(args);

if (argv._.length < 2) {
  console.error('The SDK type and project name are mandatory');
  console.info('usage: create typescript <@scope/package>');
  process.exit(-1);
}

const sdkType = argv._[0];
let [name, pck] = argv._[1].replace(/^@/, '').split('/');

if (sdkType !== 'typescript') {
  console.error('Only the generation of "typescript" SDK is available');
  process.exit(-2);
}

if (!pck) {
  console.warn(`The given package name, is not a scoped package. a default "@${defaultScope}" scope will be used`);
  pck = name;
  name = defaultScope;
}

const targetDirectory = join('.', name, pck);
const schematicsPackage = dirname(require.resolve('@ama-sdk/schematics/package.json'));
const schematicsToRun = [
  `${schematicsPackage}:typescript-shell`,
  ...(argv['spec-path'] ? [`${schematicsPackage}:typescript-core`] : [])
];

let defaultPackageManager = 'npm';
if (packageManagerEnv && ['npm', 'yarn'].includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}

const packageManager = argv['package-manager'] || defaultPackageManager;

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
  '--name', name,
  '--package', pck,
  '--package-manager', packageManager,
  '--directory', targetDirectory,
  ...(argv['spec-path'] ? ['--spec-path', argv['spec-path']] : [])
];

const getSchematicStepInfo = (schematic: string) => ({
  args: [binPath, schematic, ...schematicArgs]
});

const run = () => {

  const steps: { args: string[]; cwd?: string }[] = [
    getSchematicStepInfo(schematicsToRun[0]),
    ...(
      packageManager === 'yarn'
        ? [{ args: ['yarn', 'set', 'version', getYarnVersion()], cwd: resolve(process.cwd(), targetDirectory)}]
        : []
    ),
    ...schematicsToRun.slice(1).map(getSchematicStepInfo)
  ];

  const errors = steps
    .map((step) => spawnSync(process.execPath, step.args, { stdio: 'inherit', cwd: step.cwd || process.cwd() }))
    .map(({error}) => error)
    .filter((err) => !!err);

  if (errors.length > 0) {
    errors.forEach((err) => console.error(err));
    if (packageManagerEnv !== 'npm') {
      console.error(`Other package managers than 'npm' are experimental for @ama-sdk create for the time being.
Please use the following command:
  'npm create @ama-sdk typescript <package-name> -- [...options]'

https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/create#usage

`);
    }
    process.exit(1);
  }
};

run();
