import * as path from 'node:path';
import helpers from 'yeoman-test';

const assert = require('yeoman-assert');

describe('@ama-sdk/sdk:core', () => {
  jest.setTimeout(30 * 60 * 1000); // 30 min

  it('should generate spec files', async () => {
    await helpers.run(__dirname)
      .withPrompts({
        swaggerSpecPath: path.resolve(__dirname, '..', '..', '..', 'testing', 'MOCK_swagger.yaml'),
        swaggerCodegenPath: path.resolve(__dirname, 'generators', 'core',
          'templates', 'swagger-codegen-typescript', 'target', 'swagger-codegen-cli.jar')
      });
    assert.file(['swagger-spec.yaml']);
  });
});
