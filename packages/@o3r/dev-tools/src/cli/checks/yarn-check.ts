#!/usr/bin/env node
console.warn('This script is deprecated, will be removed in Otter v10');

if (!process.env.npm_execpath || process.env.npm_execpath!.indexOf('yarn') === -1) {
  throw new Error('Please use Yarn instead of NPM to install dependencies. See: https://yarnpkg.com/lang/en/docs/install/');
}
