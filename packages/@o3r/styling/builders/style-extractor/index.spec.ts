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
  StyleExtractorBuilderSchema,
} from './schema';

describe('Styling Extractor Builder', () => {
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

  it('should extract css variables', async () => {
    const options: StyleExtractorBuilderSchema = {
      name: 'showcase',
      filePatterns: ['apps/showcase/src/**/*.style.scss'],
      ignoreInvalidValue: true,
      watch: false,
      libraries: [],
      inline: false,
      ignoreDuplicateWarning: false,
      outputFile: path.resolve(__dirname, workspaceRoot, 'apps/showcase/style.metadata.json')
    };
    const run = await architect.scheduleBuilder('.:extractor', options as any);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const styleOutput = JSON.parse(virtualFileSystem.readFileSync(options.outputFile, { encoding: 'utf8' }));
    expect(typeof styleOutput).toBe('object');
    expect(typeof styleOutput.variables).toBe('object');
  });
});
