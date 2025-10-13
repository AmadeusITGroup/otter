type Level = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger type for MCP server
 */
export type Logger = {
  /**
   * Log a message at the given level
   * @param message The message to log
   * @param meta Additional metadata to log (should be stringifyable)
   */
  [K in Level]?: (message: string, meta?: any) => any;
};

/**
 * Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
 * @param level
 */
const logInStderr = (level: Level): Required<Logger>[Level] => (message: string, meta?: any) => process.stderr.write(
  JSON.stringify({
    level,
    message,
    meta
  }) + '\n'
);

/**
 * Logger for MCP server
 */
export const logger = {
  error: logInStderr('error'),
  warn: logInStderr('warn'),
  info: logInStderr('info'),
  debug: logInStderr('debug')
} as const satisfies Logger;
