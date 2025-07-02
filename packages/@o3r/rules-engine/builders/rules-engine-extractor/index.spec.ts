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
  RulesEngineExtractorBuilderSchema,
} from './schema';

describe('Rules-engine Extractor Builder', () => {
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

  it('should extract rules-engine metadata', async () => {
    const options: RulesEngineExtractorBuilderSchema = {
      tsConfig: 'apps/showcase/tsconfig.cms.json',
      libraries: [
        path.resolve(__dirname, workspaceRoot, 'packages/@o3r/rules-engine')
      ],
      factFilePatterns: [
        'apps/showcase/src/facts/**/*.facts.ts'
      ],
      operatorFilePatterns: [
        'apps/showcase/src/operators/**/*.ts'
      ],
      outputFactsDirectory: path.resolve(__dirname, workspaceRoot, 'apps/showcase'),
      outputOperatorsDirectory: path.resolve(__dirname, workspaceRoot, 'apps/showcase'),
      ignoreFactsFromLibraries: []
    };
    const run = await architect.scheduleBuilder('.:extractor', options);
    const output = await run.result;
    expect(output.error).toBeUndefined();
    await run.stop();

    const factsOutput = JSON.parse(virtualFileSystem.readFileSync(path.join(options.outputFactsDirectory, 'rules.facts.metadata.json'), { encoding: 'utf8' }));
    expect(typeof factsOutput).toBe('object');
    expect(typeof factsOutput.facts).toBe('object');
    expect(typeof factsOutput.facts.length).toBe('number');

    const operatorsOutput = JSON.parse(virtualFileSystem.readFileSync(path.join(options.outputOperatorsDirectory, 'rules.operators.metadata.json'), { encoding: 'utf8' }));
    expect(typeof operatorsOutput).toBe('object');
    expect(typeof operatorsOutput.operators).toBe('object');
    expect(typeof operatorsOutput.operators.length).toBe('number');
  });
});
