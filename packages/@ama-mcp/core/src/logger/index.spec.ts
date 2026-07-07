import {
  MCPLogger,
} from './index';

let stderrWriteSpy: jest.SpyInstance;

describe('MCPLogger', () => {
  beforeEach(() => {
    stderrWriteSpy = jest.spyOn(process.stderr, 'write');
  });

  it('should log messages at or above the set level', () => {
    const logger = new MCPLogger('test-logger', 'warn');

    logger.error('This is an error');
    logger.warn('This is a warning');
    logger.info('This is info');
    logger.debug('This is debug');

    expect(stderrWriteSpy).toHaveBeenCalledTimes(2);
    expect(stderrWriteSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('"level":"error"'));
    expect(stderrWriteSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('"level":"warn"'));
  });

  it('should change log level with setLevel', () => {
    const logger = new MCPLogger('test-logger', 'error');

    logger.info('This is info');
    expect(stderrWriteSpy).toHaveBeenCalledTimes(0);

    logger.setLevel('info');
    logger.info('This is info after level change');
    expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
    expect(stderrWriteSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('"level":"info"'));
  });

  it('should throw an error for invalid log levels', () => {
    const logger = new MCPLogger('test-logger');

    expect(() => logger.setLevel('invalid' as any)).toThrow('Invalid log level: invalid');
    expect(() => new MCPLogger('test-logger', 'invalid' as any)).toThrow('Invalid log level: invalid');
  });

  it('should log messages with correct format', () => {
    const logger = new MCPLogger('test-logger', 'debug');

    logger.debug('Debug message', { key: 'value' });

    expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
    const loggedMessage = stderrWriteSpy.mock.calls[0][0];
    const logObject = JSON.parse(loggedMessage);

    expect(logObject).toMatchObject({
      name: 'test-logger',
      level: 'debug',
      message: 'Debug message',
      meta: { key: 'value' }
    });
  });

  it('should handle logging without meta', () => {
    const logger = new MCPLogger('test-logger', 'info');

    logger.info('Info message without meta');

    expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
    const loggedMessage = stderrWriteSpy.mock.calls[0][0];
    const logObject = JSON.parse(loggedMessage);

    expect(logObject).toMatchObject({
      name: 'test-logger',
      level: 'info',
      message: 'Info message without meta'
    });
    expect(logObject).not.toHaveProperty('meta');
  });

  it('should respect silent log level', () => {
    const logger = new MCPLogger('test-logger', 'silent');

    logger.error('This is an error');
    logger.warn('This is a warning');
    logger.info('This is info');
    logger.debug('This is debug');

    expect(stderrWriteSpy).toHaveBeenCalledTimes(0);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
