#!/usr/bin/env node

/**
 * Generate the screenshots for the E2E tests of the showcase app using a docker image running on ubuntu
 * The goal is to make sure everybody generate the screenshots using the same platform to prevent mismatches
 */
const os = require('node:os');
const childProcess = require('node:child_process');
const playwrightVersion = require('@playwright/test/package.json').version;

// We should be able to use `host.docker.internal` but it seems to fail depending on the network configuration
const ipAddresses = [
  'http://host.docker.internal:8080',
  ...Object.values(os.networkInterfaces())
    .flat()
    .filter((net) => net.family === 'IPv4' && net.address !== '127.0.0.1')
    .map((net) => `http://${net.address}:8080`)
];

// Command that will be run inside the docker container
const containerScript = [
  // Find a working IP
  `export PLAYWRIGHT_TARGET_URL=$(echo '${ipAddresses.join(',')}' | xargs -d, -r -I {} sh -c 'wget -T 2 -t 1 -q {} && echo {}' 2>null | sed 1q)`,

  // Exit if nothing works
  `[ $PLAYWRIGHT_TARGET_URL ] || { echo 'The http-server cannot be reached with any of [${ipAddresses.join(', ')}]' >&2; exit 0; }`,

  // Copy local repo inside a temporary folder
  'git clone tests tests-clone',

  // Move to the folder
  'cd tests-clone',

  // Delete the existing screenshots
  'rm -rdf apps/showcase/e2e-playwright/sanity/screenshots',

  // Configure the global cache to target a folder outside the container to have it available for the following runs
  'yarn config set enableGlobalCache true',
  'yarn config set globalFolder ../tests/.cache/e2e',

  // Install the dependencies needed to run the tests
  'yarn install --mode=skip-build',

  // Run the tests
  'yarn test-e2e -u',

  // Copy the newly generated screenshots outside the container
  'cp -r apps/showcase/e2e-playwright/sanity/screenshots ../tests/apps/showcase/e2e-playwright/sanity'
].join(' && ');

// Command to create the docker container and run the script
const script = `docker run -it --rm --ipc=host -v "../../":/tests mcr.microsoft.com/playwright:v${playwrightVersion}-jammy /bin/bash -c "${containerScript}"`;

// Execute the script
childProcess.execSync(script, {stdio: 'inherit'});
