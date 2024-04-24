/**
 * Logger Client interface.
 *
 * Duplicate from [@o3r/core]{@link https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/core/src/log/logger.ts}
 * All modifications should be made in both interfaces
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
  info?(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  log(message?: any, ...optionalParams: any[]): void;

  /**
   * Log a debug message.
   * @param message Message to log
   * @param optionalParams Optional parameters to log
   */
  debug?(message?: any, ...optionalParams: any[]): void;
}
