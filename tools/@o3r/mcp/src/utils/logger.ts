type Level = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
 * @param level
 * @param message
 * @param meta Should be stringifyable
 */
const log = (level: Level, message: string, meta: any) => process.stderr.write(
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
  error: (m: string, meta?: any) => log('error', m, meta),
  warn: (m: string, meta?: any) => log('warn', m, meta),
  info: (m: string, meta?: any) => log('info', m, meta),
  debug: (m: string, meta?: any) => log('debug', m, meta)
};
