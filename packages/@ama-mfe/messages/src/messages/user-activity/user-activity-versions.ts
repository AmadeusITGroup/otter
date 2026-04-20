import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  USER_ACTIVITY_MESSAGE_TYPE,
  UserActivityEventType,
} from './base';

/**
 * User activity message version 1.0
 * Sent from embedded modules to the shell to indicate user interaction
 */
export interface UserActivityMessageV1_0 extends VersionedMessage {
  /** @inheritdoc */
  type: typeof USER_ACTIVITY_MESSAGE_TYPE;
  /** @inheritdoc */
  version: '1.0';
  /** The type of activity event that occurred */
  eventType: UserActivityEventType;
  /** Timestamp when the activity occurred */
  timestamp: number;
}
