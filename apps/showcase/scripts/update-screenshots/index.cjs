#!/usr/bin/env node

/**
 * Generate the screenshots for the E2E tests of the showcase app using a docker image running on ubuntu
 * The goal is to make sure everybody generate the screenshots using the same platform to prevent mismatches
 */
const childProcess = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const playwrightVersion = require('@playwright/test/package.json').version;
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

const absolutePathFromRoot = path.resolve(__dirname, '..', '..', '..', '..');

const relativePathFromRoot = path.relative(absolutePathFromRoot, __dirname).replace(/[/\\]+/g, '/');

// The path to mount the local repository inside the container
const mountPath = '/tests';

// The path to the script that will be run inside the container
const pathToPodmanScript = path.posix.join(mountPath, relativePathFromRoot, 'podman-script.sh');

// We should be able to use `host.docker.internal` but it seems to fail depending on the network configuration
const ipAddresses = [
  'http://host.docker.internal:8080',
  ...Object.values(os.networkInterfaces())
    .flat()
    .filter((net) => net.family === 'IPv4' && net.address !== '127.0.0.1')
    .map((net) => `http://${net.address}:${argv.port || '8080'}`)
];

// Command to create the docker container and run the script
const script = argv.docker || 'docker';
const args = [
  'run',
  '-it',
  '--rm',
  '--ipc', 'host',
  '-v', `${absolutePathFromRoot}/:${mountPath}`,
  `mcr.microsoft.com/playwright:v${playwrightVersion}-noble`,
  '/bin/bash',
  pathToPodmanScript,
  ipAddresses.join(',')
];

// eslint-disable-next-line no-console -- no other logger available
console.log(`Executing: ${script} ${args.join(' ')}`);

// Execute the script
childProcess.execFileSync(script, args, { stdio: 'inherit', shell: process.platform === 'win32' });
