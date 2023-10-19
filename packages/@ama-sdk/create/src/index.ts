#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import * as minimist from 'minimist';

const defaultScope = 'sdk';
const binPath = resolve(require.resolve('@angular-devkit/schematics-cli/package.json'), '../bin/schematics.js');
const args = process.argv.slice(2);
const argv = minimist(args);

if (argv._.length < 2) {
  // eslint-disable-next-line no-console
  console.error('The SDK type and project name are mandatory');
  console.info('usage: create typescript <@scope/package>');
  process.exit(-1);
}

const sdkType = argv._[0];
let [name, pck] = argv._[1].replace(/^@/, '').split('/');

if (sdkType !== 'typescript') {
  // eslint-disable-next-line no-console
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

const packageManagerEnv = process.env.npm_config_user_agent?.split('/')[0];
let defaultPackageManager = 'npm';
if (packageManagerEnv && ['npm', 'yarn'].includes(packageManagerEnv)) {
  defaultPackageManager = packageManagerEnv;
}

const packageManager = argv['package-manager'] || defaultPackageManager;

const run = () => {
  const schematicArgs = [
    argv.debug !== undefined ? `--debug=${argv.debug as string}` : '--debug=false', // schematics enable debug mode per default when using schematics with relative path
    '--name', name,
    '--package', pck,
    '--package-manager', packageManager,
    '--directory', targetDirectory,
    ...(argv['spec-path'] ? ['--spec-path', argv['spec-path']] : [])
  ];

  const errors = schematicsToRun
    .map((schematic) => spawnSync(process.execPath, [binPath, schematic, ...schematicArgs], { stdio: 'inherit', cwd: process.cwd()}))
    .map(({error}) => error)
    .filter((err) => !!err);

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    errors.forEach((err) => console.error(err));
    process.exit(1);
  }
};

run();
