import type {
  Message,
  MessagePeerType,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
  ErrorMessageV1_0,
  MESSAGE_ERROR_TYPE,
} from './error/index';

/**
 * Helper function to send an error message by the given endpoint (peer)
 * @param peer The endpoint sending the message
 * @param content the content of the error message to be sent
 */
export const sendError = (peer: MessagePeerType<any>, content: ErrorContent) => {
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
export const isErrorMessage = (message: any): message is Message & { type: typeof MESSAGE_ERROR_TYPE } & ErrorContent => (message && message.type === 'error' && !!message.reason);
