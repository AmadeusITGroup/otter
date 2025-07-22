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
  ComponentExtractorBuilderSchema,
} from './schema';

describe('Component Extractor Builder', () => {
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

  it('should extract components', async () => {
    const options: ComponentExtractorBuilderSchema = {
      tsConfig: 'apps/showcase/tsconfig.cms.json',
      configOutputFile: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/component.config.metadata.json`),
      componentOutputFile: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/component.class.metadata.json`),
      name: 'showcase',
      libraries: [],
      placeholdersMetadataFilePath: path.resolve(__dirname, `${workspaceRoot}/apps/showcase/placeholders.metadata.manual.json`),
      exposedComponentSupport: true,
      globalConfigCategories: [
        { name: 'globalCategory', label: 'Global category' }
      ],
      filePattern: 'src/**/*.(component|config|module).ts',
      inline: false,
      strictMode: false,
      watch: false
    };
    const run = await architect.scheduleBuilder('.:extractor', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const componentOutput = JSON.parse(await virtualFileSystem.promises.readFile(options.componentOutputFile, { encoding: 'utf8' }));
    expect(typeof componentOutput).toBe('object');
    expect(typeof componentOutput.length).toBe('number');
    expect(componentOutput[0].library).toBe('showcase');
    expect(componentOutput[0].name).toMatch(/.*Component$/);
    expect(componentOutput[0].path).toMatch(/.*component.ts$/);

    const configOutput = JSON.parse(await virtualFileSystem.promises.readFile(options.configOutputFile, { encoding: 'utf8' }));
    expect(typeof configOutput).toBe('object');
    expect(typeof configOutput.length).toBe('number');
    expect(configOutput[0].library).toBe('showcase');
    expect(configOutput[0].name).toMatch(/.*Config$/);
    expect(configOutput[0].path).toMatch(/.*config.ts$/);
  });
});
