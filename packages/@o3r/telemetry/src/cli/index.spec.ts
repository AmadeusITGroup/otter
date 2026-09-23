/* eslint-disable import/first, import/order -- module mocks must be registered before importing the tested module */
import type {
  Mock,
} from 'vitest';

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

import {
  createCliWithMetrics,
} from './index';

const expectedOutput = { success: true };
const options = { example: 'test' };
const originalArgv = [...process.argv];
const originalEnv = { ...process.env };

describe('CLI with metrics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.argv = [...originalArgv];
    process.env = { ...originalEnv };
  });

  it('should run the original builder with the same options', async () => {
    const originalCliFn = vi.fn(() => expectedOutput);
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    const output = await cliFn(options);
    expect(output).toEqual(expect.objectContaining(expectedOutput));
    expect(originalCliFn).toHaveBeenCalled();
    expect(originalCliFn).toHaveBeenCalledWith(options);
  });

  it('should throw the same error as the original one', async () => {
    const error = new Error('error example');
    const originalCliFn = vi.fn(() => {
      throw error;
    });
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    await expect(() => cliFn(options)).rejects.toThrow(error);
    expect(originalCliFn).toHaveBeenCalled();
    expect(originalCliFn).toHaveBeenCalledWith(options);
  });

  it('should throw if the builder function is a rejected Promise', async () => {
    const originalCliFn = vi.fn(() => Promise.reject(new Error('rejected')));
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    await expect(() => cliFn(options)).rejects.toThrow();
  });

  describe('sendData', () => {
    let cliFn: ReturnType<typeof createCliWithMetrics>;
    let originalCliFn: Mock;
    let sendDataMock: Mock;

    beforeEach(() => {
      originalCliFn = vi.fn(() => expectedOutput);
      sendDataMock = vi.fn(() => Promise.resolve());
      cliFn = createCliWithMetrics(originalCliFn, 'cli-test', { sendData: sendDataMock });

      process.env = { ...process.env, O3R_METRICS: 'true' };
    });

    it('should call sendData with the options given by argument', async () => {
      const preParsedOptions = {
        preParsedParam: 'value'
      };
      cliFn = createCliWithMetrics(originalCliFn, 'cli-test', { sendData: sendDataMock, preParsedOptions });
      process.argv = ['', '', 'param1', '--param2', 'value2', '--param3'];
      await cliFn(options);

      expect(sendDataMock).toHaveBeenCalled();
      expect(sendDataMock).toHaveBeenCalledWith(expect.objectContaining({
        cli: {
          name: 'cli-test',
          options: preParsedOptions
        }
      }), expect.anything());
    });

    it('should call sendData with the data parsed by minimist', async () => {
      process.argv = ['', '', 'param1', '--param2', 'value2', '--param3'];
      await cliFn(options);

      expect(sendDataMock).toHaveBeenCalled();
      expect(sendDataMock).toHaveBeenCalledWith(expect.objectContaining({
        cli: {
          name: 'cli-test',
          options: expect.objectContaining({
            _: ['param1'],
            param2: 'value2',
            param3: true
          })
        }
      }), expect.anything());
    });

    it('should not call sendData because called with --no-o3r-metrics', async () => {
      process.argv = ['', '', '--param1', 'value1', '--param2', '--no-o3r-metrics'];
      await cliFn(options);
      expect(sendDataMock).not.toHaveBeenCalled();
    });

    it('should not call sendData because called with --no-o3rMetrics', async () => {
      process.argv = ['', '', '--param1', 'value1', '--param2', '--no-o3rMetrics'];
      await cliFn(options);
      expect(sendDataMock).not.toHaveBeenCalled();
    });
  });
});
