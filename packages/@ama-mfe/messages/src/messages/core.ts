import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';

/** Base structure for all versioned messages in the communication protocol. */
export interface StrictTypedVersionedMessage<V extends string, T extends string> extends VersionedMessage {
  /** @inheritdoc */
  version: V;
  /** @inheritdoc */
  type: T;
}
