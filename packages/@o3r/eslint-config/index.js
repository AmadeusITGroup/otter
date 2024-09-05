/*

This files is used to allow the usage of the eslint config within @o3r/framework mono-repository.
It should not be part of the package.

*/

const {resolve} = require('node:path');

require('ts-node').register({ project: resolve(__dirname, 'tsconfig.build.json') });
require('ts-node').register = () => {};

module.exports = require('./index.ts');
