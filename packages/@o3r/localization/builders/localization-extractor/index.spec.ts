import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Architect
} from '@angular-devkit/architect';
import {
  TestingArchitectHost
} from '@angular-devkit/architect/testing';
import {
  schema
} from '@angular-devkit/core';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem
} from '@o3r/test-helpers';
import {
  LocalizationExtractorBuilderSchema
} from './schema';

describe('Localization Extractor Builder', () => {
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
    architectHost.addBuilder('.:extractor', require('./index').default);
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should extract the localizations', async () => {
    const options: LocalizationExtractorBuilderSchema = {
      tsConfig: 'apps/showcase/tsconfig.cms.json',
      outputFile: path.resolve(__dirname, workspaceRoot, 'apps/showcase/localisation.metadata.json'),
      libraries: [],
      extraFilePatterns: [
        'src/i18n/*.localization.json'
      ],
      watch: false,
      ignoreDuplicateKeys: false,
      inline: false,
      sortKeys: false,
      strictMode: false
    };
    const run = await architect.scheduleBuilder('.:extractor', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const localizationOutput = JSON.parse(virtualFileSystem.readFileSync(options.outputFile, { encoding: 'utf8' }));
    expect(typeof localizationOutput).toBe('object');
    expect(typeof localizationOutput.length).toBe('number');
    expect(localizationOutput[0].key).toMatch(/o3r-.*/);
  });
});
