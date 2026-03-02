/**
 * Logger Client interface.
 */
export interface Logger {
  /**
   * Log an error.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  error(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a warning.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  warn(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  info(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  log?(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a debug message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  debug?(message?: any, ...optionalParams: any[]): void;
}

/** Log levels for logger */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const noop = () => {};

/**
 * Get a logger with the specified log level
 * @param level
 * @param logger
 */
export const getLogger = (level?: LogLevel, logger: Logger = console) => {
  if (level) {
    switch (level) {
      case 'silent': {
        logger = { ...logger, error: noop, log: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'error': {
        logger = { ...logger, warn: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'warn': {
        logger = { ...logger, info: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'info': {
        logger = { ...logger, debug: noop };
      }
    }
  }
  return logger;
};
