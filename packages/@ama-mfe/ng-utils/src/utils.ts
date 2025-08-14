import type {
  Message,
  PeerConnectionOptions,
} from '@amadeus-it-group/microfrontends';
import {
  getHostInfo,
} from './host-info';
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
 * As `origin`, it will take the hostURL from {@link getHostInfo} and the `window` will be the parent window.
 */
export function getDefaultClientEndpointStartOptions(): PeerConnectionOptions {
  const hostInfo = getHostInfo();
  if (hostInfo.hostURL) {
    return {
      origin: new URL(hostInfo.hostURL).origin,
      window: window.parent
    };
  }
  return {};
}

/**
 * Return `true` if embedded inside an iframe, `false` otherwise
 * @param windowParam - optional parameter for testing purposes, defaults to `window`
 */
export function isEmbedded(windowParam: Window = window) {
  return windowParam.top !== windowParam.self;
}
