/*

This file is used to allow the use of the builder in the @o3r/framework mono-repository.
It should not be part of the package.

*/

const {resolve} = require('node:path');

require('ts-node').register({ project: resolve(__dirname, '..', '..', 'tsconfig.builders.json') });
require('ts-node').register = () => {};

module.exports = require('./index.ts');
