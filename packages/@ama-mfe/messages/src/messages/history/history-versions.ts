import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  HISTORY_MESSAGE_TYPE,
} from './base';

/**
 * The history message object sent via the communication protocol.
 * Used in microfrontend architecture based on iframes where an iframe uses history navigation
 */
export interface HistoryV1_0 extends VersionedMessage {
  /** @inheritdoc */
  type: typeof HISTORY_MESSAGE_TYPE;
  /** @inheritdoc */
  version: '1.0';
  /** The delta of history states to navigate (negative is backward, 0 is reload, positive is forward) */
  delta: number;
}
