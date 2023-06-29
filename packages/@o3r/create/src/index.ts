#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import * as minimist from 'minimist';

const binPath = join(require.resolve('@angular/cli/package.json'), '../bin/ng.js');
const args = process.argv.slice(2);
const argv = minimist(args);

if (argv._.length === 0) {
  // eslint-disable-next-line no-console
  console.error('The project name is mandatory');
  process.exit(-1);
}

const hasPackageManagerArg = args.some((a) => a.startsWith('--package-manager'));
if (!hasPackageManagerArg) {
  const packageManager = process.env.npm_config_user_agent?.split('/')[0];
  if (packageManager && ['npm', 'pnpm', 'yarn', 'cnpm'].includes(packageManager)) {
    args.push('--package-manager', packageManager);
  }
}

const createNgProject = () => {
  const { error } = spawnSync(process.execPath, [binPath, 'new', ...args], {
    stdio: 'inherit'
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

const addOtterCore = (relativeDirectory = '.') => {
  const cwd = resolve(process.cwd(), relativeDirectory);
  const { error } = spawnSync(process.execPath, [binPath, 'add', '@o3r/core'], {
    stdio: 'inherit',
    cwd
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(2);
  }
};

const projectFolder = argv._[0]?.replaceAll(' ', '-').toLowerCase() || '.';
createNgProject();
addOtterCore(projectFolder);
