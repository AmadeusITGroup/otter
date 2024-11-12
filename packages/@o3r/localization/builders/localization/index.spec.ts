import {Architect, createBuilder} from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LocalizationBuilderSchema } from './schema';

describe('Localization Builder', () => {
  const workspaceRoot = path.join('..', '..', '..', '..', '..');
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let virtualFileSystem: typeof fs;

  beforeEach(async () => {
    virtualFileSystem = useVirtualFileSystem();

    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(path.resolve(__dirname, workspaceRoot), __dirname);
    architect = new Architect(architectHost, registry);
    architectHost.addBuilder('.:localization', require('./index').default);
    architectHost.addBuilder('noop', createBuilder(() => ({success: true})));
    architectHost.addTarget({project: 'showcase', target: 'compile'}, 'noop', {
      outputPath: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/dist`)
    });
    architectHost.addTarget({project: 'showcase', target: 'extract-translations'}, 'noop', {
      outputFile: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/localisation.metadata.json`)
    });
    await virtualFileSystem.promises.mkdir(path.resolve(__dirname, `${workspaceRoot}/apps/showcase`), {recursive: true});
    await virtualFileSystem.promises.writeFile(path.resolve(__dirname, `${workspaceRoot}/apps/showcase/localisation.metadata.json`), '[]');
  });
  afterEach(() => {
    cleanVirtualFileSystem();
  });

  it('should generate the localizations', async () => {
    const options: LocalizationBuilderSchema = {
      browserTarget: 'showcase:compile',
      localizationExtracterTarget: 'showcase:extract-translations',
      locales: [
        'en-GB',
        'fr-FR'
      ],
      assets: [
        'apps/showcase/src/assets/locales',
        'apps/showcase/src/assets/locales/*',
        'apps/showcase/src/components/**/i18n'
      ],
      outputPath: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/dev-resources/localizations`),
      checkUnusedTranslation: true,
      defaultLanguageMapping: {},
      failIfMissingMetadata: false,
      watch: false,
      ignoreReferencesIfNotDefault: false,
      useMetadataAsDefault: true
    };
    await virtualFileSystem.promises.mkdir(options.outputPath, {recursive: true});
    const run = await architect.scheduleBuilder('.:localization', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const localizationOutput = virtualFileSystem.readdirSync(options.outputPath);
    expect(localizationOutput).toContain('en-GB.json');
    expect(localizationOutput).toContain('fr-FR.json');
  });
});
