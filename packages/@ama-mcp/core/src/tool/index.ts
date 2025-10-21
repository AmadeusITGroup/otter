import type {
  LoggerToolOptions,
} from '../logger';

/**
 * Possible override for tool definition
 */
export interface ToolDefinition extends LoggerToolOptions {
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
