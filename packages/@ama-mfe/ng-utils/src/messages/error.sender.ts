import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  MessagePeerServiceType,
} from '@amadeus-it-group/microfrontends-angular';
import type {
  ERROR_MESSAGE_TYPE,
  ErrorContent,
  ErrorMessageV1_0,
} from './error/index';

/**
 * Helper function to send an error message by the given endpoint (peer)
 * @param peer The endpoint sending the message
 * @param content the content of the error message to be sent
 */
export const sendError = (peer: MessagePeerServiceType<any>, content: ErrorContent) => {
  return peer.send({
    type: 'error',
    version: '1.0',
    ...content
  } satisfies ErrorMessageV1_0);
};

/**
 * Check if the given message is of type error and the error reson is present too
 * @param message the message to be checked
 */
// eslint-disable-next-line @stylistic/max-len -- constant definition
export const isErrorMessage = (message: any): message is VersionedMessage & { type: typeof ERROR_MESSAGE_TYPE } & ErrorContent => (message && typeof message === 'object' && message.type === 'error' && !!message.reason);
