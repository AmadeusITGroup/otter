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

// eslint-disable-next-line import/first -- needs to mock modules first
import {
  createCliWithMetrics
} from './index';

const expectedOutput = { success: true };
const options = { example: 'test' };

describe('CLI with metrics', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run the original builder with the same options', async () => {
    const originalCliFn = jest.fn(() => expectedOutput);
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    const output = await cliFn(options);
    expect(output).toEqual(expect.objectContaining(expectedOutput));
    expect(originalCliFn).toHaveBeenCalled();
    expect(originalCliFn).toHaveBeenCalledWith(options);
  });

  it('should throw the same error as the original one', async () => {
    const error = new Error('error example');
    const originalCliFn = jest.fn(() => {
      throw error;
    });
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    await expect(() => cliFn(options)).rejects.toThrow(error);
    expect(originalCliFn).toHaveBeenCalled();
    expect(originalCliFn).toHaveBeenCalledWith(options);
  });

  it('should throw if the builder function is a rejected Promise', async () => {
    const originalCliFn = jest.fn(() => Promise.reject(new Error('rejected')));
    const cliFn = createCliWithMetrics(originalCliFn, 'cli-test');
    await expect(() => cliFn(options)).rejects.toThrow();
  });

  describe('sendData', () => {
    let cliFn: ReturnType<typeof createCliWithMetrics>;
    let originalCliFn: jest.Mock;
    let sendDataMock: jest.Mock;

    beforeEach(() => {
      originalCliFn = jest.fn(() => expectedOutput);
      sendDataMock = jest.fn(() => Promise.resolve());
      cliFn = createCliWithMetrics(originalCliFn, 'cli-test', { sendData: sendDataMock });

      jest.replaceProperty(process, 'env', { ...process.env, O3R_METRICS: 'true' });
    });

    it('should call sendData with the options given by argument', async () => {
      const preParsedOptions = {
        preParsedParam: 'value'
      };
      cliFn = createCliWithMetrics(originalCliFn, 'cli-test', { sendData: sendDataMock, preParsedOptions });
      jest.replaceProperty(process, 'argv', ['', '', 'param1', '--param2', 'value2', '--param3']);
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
      jest.replaceProperty(process, 'argv', ['', '', 'param1', '--param2', 'value2', '--param3']);
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
      jest.replaceProperty(process, 'argv', ['', '', '--param1', 'value1', '--param2', '--no-o3r-metrics']);
      await cliFn(options);
      expect(sendDataMock).not.toHaveBeenCalled();
    });

    it('should not call sendData because called with --no-o3rMetrics', async () => {
      jest.replaceProperty(process, 'argv', ['', '', '--param1', 'value1', '--param2', '--no-o3rMetrics']);
      await cliFn(options);
      expect(sendDataMock).not.toHaveBeenCalled();
    });
  });
});
