import * as path from 'node:path';
import helpers from 'yeoman-test';

const assert = require('yeoman-assert');

let tmpDir: string;

describe.skip('@ama-sdk/sdk:shell', () => {
  jest.setTimeout(30 * 1000);

  beforeAll(async () => {
    await helpers.run(__dirname)
      .inTmpDir((dir) => tmpDir = dir)
      .withPrompts({
        projectName: 'ama-sdkTest',
        projectPackageName: 'sdkTest',
        projectDescription: 'test description',
        projectHosting: 'Other'
      });
  });

  it('should generate a package.json file with a correct name', () => {
    assert.file(['package.json']);
    const packageJson: {[key: string]: string} = require(path.resolve(tmpDir, 'package.json'));

    expect(packageJson.version).toEqual('0.0.0');
    expect(packageJson.name).toEqual('@ama-sdkTest/sdkTest');
  });

  it('should generate .gitignore file', () => {
    assert.file(['.gitignore']);
  });
});
