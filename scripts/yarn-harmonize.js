const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');

const rootDir = join(__dirname, '..');
const mainPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json')).toString());
const sdkTemplatePackageJsonPath = join(rootDir, 'packages', '@ama-sdk', 'generator-sdk', 'src', 'generators', 'shell', 'templates', 'base', 'package.json');
const templatePackageJson = JSON.parse(readFileSync(sdkTemplatePackageJsonPath).toString());

templatePackageJson.packageManager = mainPackageJson.packageManager;
writeFileSync(sdkTemplatePackageJsonPath, JSON.stringify(templatePackageJson, null, 2));
