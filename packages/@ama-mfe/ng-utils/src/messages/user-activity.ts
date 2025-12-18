import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityMessage,
} from '@ama-mfe/messages';
import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';

/**
 * Type guard to check if a message is a user activity message
 * @param message The message to check
 */
export function isUserActivityMessage(message: unknown): message is UserActivityMessage {
  return (
    typeof message === 'object'
    && message !== null
    && 'type' in message
    && (message as VersionedMessage).type === USER_ACTIVITY_MESSAGE_TYPE
  );
}
