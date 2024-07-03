#!/bin/bash

# Read first argument which is the list of ip addresses
ipAddresses=$1

echo "=> Entering podman container"

# Find a working IP
export PLAYWRIGHT_TARGET_URL=$(echo $ipAddresses | xargs -d, -r -I {} sh -c 'wget -T 2 -t 1 -q {} && echo {}' 2>null | sed 1q)

# Exit if nothing works
[ $PLAYWRIGHT_TARGET_URL ] || { echo 'The http-server cannot be reached with any of [$ipAddresses}]' >&2; exit 0; }

# Copy local repo inside a temporary folder
echo "Cloning local repo... (Don't forget to commit all the needed files for e2e)"
git clone tests tests-clone

# Move to the folder
cd tests-clone

# Delete the existing screenshots
echo 'Delete previous screenshots'
rm -rdf apps/showcase/e2e-playwright/sanity/screenshots

# Configure the global cache to target a folder outside the container to have it available for the following runs
yarn config set enableGlobalCache true
yarn config set globalFolder ../tests/.cache/e2e

# Install the dependencies needed to run the tests
echo 'Install deps'
yarn install --mode=skip-build

# Run the tests
echo 'Run e2e tests'
yarn workspace @o3r/showcase run test:playwright:sanity -g "Visual comparison" -u

# Copy the newly generated screenshots outside the container
echo 'Copy screenshots'
cp -r apps/showcase/e2e-playwright/sanity/screenshots ../tests/apps/showcase/e2e-playwright/sanity

status=$?
[ $status -eq 0 ] && echo "Screenshots created/updated successfully!" || echo "Failed to create/update screenshots."
[ $status -eq 0 ] && echo "You can now add the screenshots, amend your commit and push it to update your PR."
echo "<= Exiting podman container"
