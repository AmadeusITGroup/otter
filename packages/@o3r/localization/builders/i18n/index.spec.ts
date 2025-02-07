import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Architect,
} from '@angular-devkit/architect';
import {
  TestingArchitectHost,
} from '@angular-devkit/architect/testing';
import {
  schema,
} from '@angular-devkit/core';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem,
} from '@o3r/test-helpers';
import {
  I18nBuilderSchema,
} from './schema';

describe('Localization i18n Builder', () => {
  const workspaceRoot = path.join('..', '..', '..', '..', '..');
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let virtualFileSystem: typeof fs;

  beforeEach(() => {
    virtualFileSystem = useVirtualFileSystem();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(path.resolve(__dirname, workspaceRoot), __dirname);
    architect = new Architect(architectHost, registry);
    architectHost.addBuilder('.:i18n', require('./index').default);
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should generate the i18n', async () => {
    const i18nFolder = path.resolve(__dirname, `${workspaceRoot}/apps/showcase/src/components/showcase/localization/i18n`);
    await virtualFileSystem.promises.mkdir(i18nFolder, { recursive: true });
    const options: I18nBuilderSchema = {
      localizationConfigs: [
        {
          localizationFiles: [
            'apps/showcase/src/!(i18n)/**/*.localization.json'
          ],
          i18nFolderPath: 'i18n'
        }
      ],
      defaultLanguageFile: 'en-GB.json'
    };
    const run = await architect.scheduleBuilder('.:i18n', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const i18nOutput = JSON.parse(virtualFileSystem.readFileSync(path.join(i18nFolder, 'en-GB.json'), { encoding: 'utf8' }));
    expect(typeof i18nOutput).toBe('object');
    expect(Object.keys(i18nOutput)[0]).toMatch(/o3r-.*/);
  });
});
