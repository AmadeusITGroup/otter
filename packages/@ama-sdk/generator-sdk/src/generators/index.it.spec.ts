/* eslint-disable no-console */
import { spawn } from 'child_process';
import * as path from 'node:path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';


const spawnPromisify = (cmd: string, args: string[], cwd?: string) => {
  console.log(`Spawning (in ${cwd}) ${cmd} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const spawned = spawn(cmd, args, {cwd, shell: true});
    spawned.stdout.pipe(process.stdout);

    spawned.stderr.pipe(process.stderr);

    spawned.on('close', resolve);
    spawned.on('error', reject);
  });
};
let tmpDir: string;

const minutes = 60 * 1000;
describe('@ama-sdk/sdk:create', () => {
  jest.setTimeout(5 * minutes);

  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, 'shell'))
      .inTmpDir((dir) => tmpDir = dir)
      .withPrompts({
        projectName: 'apiTest',
        projectPackageName: 'sdkTest',
        projectDescription: 'test description',
        projectHosting: 'Other'
      });
  });

  // Enable it back once the rebase on the sdk has been done
  it('should generate a working SDK', async () => {
    assert.file(['package.json']);
    // In test, the version of @ama-sdk are 0.0.0 and can't be installed withtout interaction so a file is used
    // to set the packages
    await spawnPromisify('yarn', ['link', `${path.resolve(__dirname, '../../..')}`, '--all'], tmpDir);
    await spawnPromisify('yarn', ['install'], tmpDir);

    await helpers
      .run(path.join(__dirname, 'core'))
      .cd(tmpDir)
      .withPrompts({
        swaggerSpecPath: path.resolve(__dirname, '..', '..', 'testing', 'MOCK_swagger.yaml'),
        swaggerCodegenPath: path.resolve(__dirname, 'generators', 'resources', 'swagger-codegen-cli.jar')
      });
    await spawnPromisify('yarn', ['run', 'build'], tmpDir);
    assert.file([
      'dist/index.d.ts',
      'dist/cjs/index.js',
      'dist/esm2015/index.js',
      'dist/esm2020/index.js',
      'dist/fixtures/jasmine/package.json',
      'dist/fixtures/jest/package.json']);
  });
});
