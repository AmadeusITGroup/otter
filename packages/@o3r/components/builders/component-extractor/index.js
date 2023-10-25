/*

This files is used to allow the usage of the builder within @o3r/framework mono-repository.
It should not be part of the package.

*/

const {resolve} = require('node:path');

require('ts-node').register({ project: resolve(__dirname, '..', '..', 'tsconfig.builders.json') });

module.exports = require('./index.ts');
