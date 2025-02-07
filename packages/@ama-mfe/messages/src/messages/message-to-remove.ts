/**
 * A message that is sent between peers
 */
export interface Message {
  /**
   * Message type
   */
  type: string;
  /**
   * Message version
   */
  version: string;
}
