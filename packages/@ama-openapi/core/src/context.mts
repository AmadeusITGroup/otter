import type {
  Logger,
} from './logger.mjs';

/**
 * Context interface for AMA OpenAPI processing
 */
export interface Context {
  /** Current working directory */
  cwd: string;
  /** Logger instance */
  logger?: Logger;
}
