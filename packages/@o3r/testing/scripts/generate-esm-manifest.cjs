const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

/** @type {import('type-fest').PackageJson}*/
const packageFileContent = { type: 'module' };

writeFileSync(resolve(__dirname, '..', 'dist', 'esm', 'package.json'), JSON.stringify(packageFileContent, null, 2));
