import type {
  Logger,
  LogLevel,
} from '../logger';

/**
 * Possible override for tool definition
 */
export interface ToolDefinition {
  /**
   * Logger instance to use for the tool
   */
  logger?: Logger;
  /**
   * Log level for the tool logger
   */
  logLevel?: LogLevel;
  /**
   * Tool name
   */
  toolName?: string;
  /**
   * Tool description
   */
  toolDescription?: string;
  /**
   * Tool title
   */
  toolTitle?: string;
}
