import type { OtterMessage, OtterMessageContent } from '@o3r/core';
import type { AvailableMessageContents } from '../services/message.interface';

/** Message from the DevTools message */
export interface ExtensionMessage<T extends OtterMessageContent = AvailableMessageContents> extends OtterMessage<T> {
  /** Destination tab ID */
  tabId: number;
}
