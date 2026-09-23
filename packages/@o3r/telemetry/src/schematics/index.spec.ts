import type {
  Mock,
} from 'vitest';
import {
  callRule,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  lastValueFrom,
} from 'rxjs';
import {
  createSchematicWithMetrics,
  SchematicWrapper,
} from './index';

vi.mock('../environment/index', async () => {
  const original = await vi.importActual<typeof import('../environment/index')>('../environment/index');
  return {
    ...original,
    getEnvironmentInfo: vi.fn(() => ({ env: 'env' }))
  };
});

vi.mock('node:perf_hooks', async () => {
  const original = await vi.importActual<typeof import('node:perf_hooks')>('node:perf_hooks');
  return {
    ...original,
    performance: {
      ...original.performance,
      now: vi.fn().mockReturnValue(0)
    }
  };
});

let context: SchematicContext;
let debug: Mock;

describe('createSchematicWithMetricsIfInstalled', () => {
  beforeEach(() => {
    debug = vi.fn();
    context = {
      schematic: {
        description: {
          collection: {
            name: 'MyCollection'
          },
          name: 'MySchematic'
        }
      },
      interactive: false,
      logger: {
        debug
      }
    } as any as SchematicContext;
  });

  it('should call the original schematic with the options and log data', async () => {
    const rule = vi.fn((tree: Tree) => tree);

    const originalSchematic = vi.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(JSON.stringify({
      environment: { env: 'env' },
      schematic: { name: 'MyCollection:MySchematic', options, interactive: false },
      duration: 0
    }, null, 2));
  });

  it('should works if we chain schematic wrapper', async () => {
    const rule = vi.fn((tree: Tree) => tree);

    const originalSchematic = vi.fn((_opts: any): Rule => rule);
    const noopSchematicWrapper: SchematicWrapper = (schematicFn) => (opts) => schematicFn(opts);
    const schematic = noopSchematicWrapper(createSchematicWithMetrics(originalSchematic));
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(JSON.stringify({
      environment: { env: 'env' },
      schematic: { name: 'MyCollection:MySchematic', options, interactive: false },
      duration: 0
    }, null, 2));
  });

  it('should throw the original error and log the error in the data', async () => {
    const error = new Error('error example');
    const rule = vi.fn(() => {
      throw error;
    });

    const originalSchematic = vi.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow(error);
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('error example'));
  });

  it('should throw if the rule is a rejected Promise', async () => {
    const rule = vi.fn(() => Promise.reject(new Error('rejected')));

    const originalSchematic = vi.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow();
  });
});
