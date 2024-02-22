jest.mock('../environment/index', () => {
  const original = jest.requireActual('../environment/index');
  return {
    ...original,
    getEnvironmentInfo: jest.fn(() => ({ env: 'env' }))
  };
});

jest.mock('node:perf_hooks', () => {
  const original = jest.requireActual('node:perf_hooks');
  return {
    ...original,
    performance: {
      ...original.performance,
      now: jest.fn().mockReturnValue(0)
    }
  };
});

import { callRule, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { lastValueFrom, of } from 'rxjs';
import { createSchematicWithMetrics, SchematicWrapper } from './index';

let context: SchematicContext;
let debug: jest.Mock;
let executePostTasks: jest.Mock;

describe('createSchematicWithMetricsIfInstalled', () => {
  beforeEach(() => {
    debug = jest.fn();
    executePostTasks = jest.fn().mockReturnValue(of(''));
    context = {
      schematic: {
        description: {
          collection: {
            name: 'MyCollection'
          },
          name: 'MySchematic'
        }
      },
      engine: {
        executePostTasks
      },
      interactive: false,
      logger: {
        debug
      }
    } as any as SchematicContext;
  });

  it('should call the original schematic with the options and log data', async () => {
    const rule = jest.fn((tree: Tree) => tree);
    // eslint-disable-next-line no-unused-vars
    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(executePostTasks).toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(JSON.stringify({
      environment: { env: 'env' },
      schematic: { name: 'MyCollection:MySchematic', options, interactive: false },
      duration: 0
    }, null, 2));
  });

  it('should works if we chain schematic wrapper', async () => {
    const rule = jest.fn((tree: Tree) => tree);
    // eslint-disable-next-line no-unused-vars
    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const noopSchematicWrapper: SchematicWrapper = (schematicFn) => (opts) => schematicFn(opts);
    const schematic = noopSchematicWrapper(createSchematicWithMetrics(originalSchematic));
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(executePostTasks).toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(JSON.stringify({
      environment: { env: 'env' },
      schematic: { name: 'MyCollection:MySchematic', options, interactive: false },
      duration: 0
    }, null, 2));
  });

  it('should throw the original error and log the error in the data', async () => {
    const error = new Error('error example');
    const rule = jest.fn(() => { throw error; });
    // eslint-disable-next-line no-unused-vars
    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow(error);
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(options);
    expect(rule).toHaveBeenCalled();
    expect(executePostTasks).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith(expect.stringContaining('error example'));
  });

  it('should throw if the rule is a rejected Promise', async () => {
    const rule = jest.fn(() => Promise.reject('rejected'));
    // eslint-disable-next-line no-unused-vars
    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow();
  });
});
