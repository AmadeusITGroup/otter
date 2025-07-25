import type {
  Message,
  PeerConnectionOptions,
} from '@amadeus-it-group/microfrontends';
import {
  ERROR_MESSAGE_TYPE,
} from './messages';

/**
 * A constant array of known message types and their versions.
 */
export const KNOWN_MESSAGES = [
  {
    type: ERROR_MESSAGE_TYPE,
    version: '1.0'
  }
] as const satisfies Message[];

/**
 * Returns the default options for starting a client endpoint peer connection.
 * As origin it will take the parent origin and the window will be the parent window
 */
export function getDefaultClientEndpointStartOptions(): PeerConnectionOptions {
  if (document.referrer) {
    return {
      origin: new URL(document.referrer).origin,
      window: window.parent
    };
  }
  return {};
}
