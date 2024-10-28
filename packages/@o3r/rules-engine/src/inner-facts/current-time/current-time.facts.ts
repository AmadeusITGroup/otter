import type {
  FactDefinitions
} from '../../engine';

/**
 * Operator facts that provide the current time
 */
export interface CurrentTimeFacts extends FactDefinitions {
  /**
   * The current time as a timestamp
   */
  o3rCurrentTime: number;
}
