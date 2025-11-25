/**
 * Log levels for MCP server logging
 * @experimental
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger type for MCP server
 * @experimental
 */
export type Logger = {
  /**
   * Log a message at the given level
   * @param message The message to log
   * @param meta Additional metadata to log (should be stringifyable)
   */
  [K in LogLevel]?: (message: string, meta?: any) => any;
};

/**
 * Options for a tool using a logger
 * @experimental
 */
export interface LoggerToolOptions {
  /**
   * Logger instance to use for the tool
   */
  logger?: Logger;
  /**
   * Log level for the tool logger
   */
  logLevel?: LogLevel;
}

const loggerOrder = ['silent', 'error', 'warn', 'info', 'debug'] as const satisfies LogLevel[];

/**
 * Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
 * @param name
 * @param level
 * @param message
 * @param meta
 */
const logInStderr = (name: string, level: LogLevel, message: string, meta?: any) => process.stderr.write(
  JSON.stringify({
    name,
    level,
    message,
    meta
  }) + '\n'
);

/**
 * MCP Logger implementation
 * @experimental
 */
export class MCPLogger implements Logger {
  constructor(
    private readonly name: string,
    private level: LogLevel = 'info'
  ) {
    this.setLevel(this.level);
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (loggerOrder.indexOf(level) <= loggerOrder.indexOf(this.level)) {
      logInStderr(this.name, level, message, meta);
    }
  }

  public setLevel(level: LogLevel) {
    if (!loggerOrder.includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    this.level = level;
  }

  public error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  public warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  public info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  public debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }
}
