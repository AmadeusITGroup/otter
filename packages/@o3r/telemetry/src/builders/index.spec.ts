import {
  Architect,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  TestingArchitectHost,
} from '@angular-devkit/architect/testing';
import {
  schema,
} from '@angular-devkit/core';
import {
  BuilderWrapper,
  createBuilderWithMetrics,
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

describe('Builder with metrics', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(() => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);
  });

  it('should run the original builder with the same options', async () => {
    const expectedOutput = { success: true };
    const originalBuilderFn = jest.fn((): BuilderOutput => expectedOutput);
    const builder = createBuilder(createBuilderWithMetrics(originalBuilderFn));
    architectHost.addBuilder('.:builder', builder);
    const options = { example: 'test' };
    const run = await architect.scheduleBuilder('.:builder', options);
    const output = await run.result;
    expect(output).toEqual(expect.objectContaining(expectedOutput));
    await run.stop();
    expect(originalBuilderFn).toHaveBeenCalled();
    expect(originalBuilderFn).toHaveBeenCalledWith(options, expect.anything());
  });

  it('should throw the same error as the original one', async () => {
    const error = new Error('error example');
    const originalBuilderFn = jest.fn((): BuilderOutput => {
      throw error;
    });
    const builder = createBuilder(createBuilderWithMetrics(originalBuilderFn));
    architectHost.addBuilder('.:builder', builder);
    const options = { example: 'test' };
    const run = await architect.scheduleBuilder('.:builder', options);
    await expect(run.result).rejects.toThrow(error);
    await run.stop();
    expect(originalBuilderFn).toHaveBeenCalled();
    expect(originalBuilderFn).toHaveBeenCalledWith(options, expect.anything());
  });

  it('should throw if the builder function is a rejected Promise', async () => {
    const originalBuilderFn = jest.fn(() => Promise.reject(new Error('rejected')));
    const builder = createBuilder(createBuilderWithMetrics(originalBuilderFn));
    architectHost.addBuilder('.:builder', builder);
    const options = { example: 'test' };
    const run = await architect.scheduleBuilder('.:builder', options);
    await expect(run.result).rejects.toThrow();
    await run.stop();
  });

  it('should works if we chain builder wrapper', async () => {
    const expectedOutput = { success: true };
    const originalBuilderFn = jest.fn((): BuilderOutput => expectedOutput);
    const noopBuilderWrapper: BuilderWrapper = (builderFn) => (opts, ctx) => builderFn(opts, ctx);
    const builder = createBuilder(noopBuilderWrapper(createBuilderWithMetrics(originalBuilderFn)));
    architectHost.addBuilder('.:builder', builder);
    const options = { example: 'test' };
    const run = await architect.scheduleBuilder('.:builder', options);
    const output = await run.result;
    expect(output).toEqual(expect.objectContaining(expectedOutput));
    await run.stop();
    expect(originalBuilderFn).toHaveBeenCalled();
    expect(originalBuilderFn).toHaveBeenCalledWith(options, expect.anything());
  });
});
