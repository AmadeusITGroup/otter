import type {
  LoggerToolOptions,
} from '../logger';

/**
 * Possible override for tool definition
 * @experimental
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
