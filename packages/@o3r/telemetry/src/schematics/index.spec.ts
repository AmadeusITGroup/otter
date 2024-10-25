import {
  callRule,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  lastValueFrom
} from 'rxjs';
import {
  createSchematicWithMetrics,
  SchematicWrapper
} from './index';

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

let context: SchematicContext;
let debug: jest.Mock;

describe('createSchematicWithMetricsIfInstalled', () => {
  beforeEach(() => {
    debug = jest.fn();
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
    const rule = jest.fn((tree: Tree) => tree);

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
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
    const rule = jest.fn((tree: Tree) => tree);

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    // eslint-disable-next-line unicorn/consistent-function-scoping -- higher-order function
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
    const rule = jest.fn(() => {
      throw error;
    });

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
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
    const rule = jest.fn(() => Promise.reject(new Error('rejected')));

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithMetrics(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow();
  });
});
