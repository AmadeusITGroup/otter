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
 * Search parameter to add to the URL when embedding an iframe containing the URL of the host.
 * This is needed to support Firefox (on which {@link https://developer.mozilla.org/docs/Web/API/Location/ancestorOrigins | location.ancestorOrigins} is not currently supported)
 * in case of redirection inside the iframe.
 */
export const MFE_HOST_URL_PARAM = 'ama-mfe-host-url';

/**
 * Returns the default options for starting a client endpoint peer connection.
 * As `origin`, it will take the parent origin and the `window` will be the parent window.
 * The parent origin will use the first found among:
 * - look for the search parameter {@link MFE_HOST_URL_PARAM} in the URL of the iframe
 * - use the first item in `location.ancestorOrigins` (currently not supported on Firefox)
 * - use `document.referrer` (will only work if called before any redirection in the iframe)
 */
export function getDefaultClientEndpointStartOptions(): PeerConnectionOptions {
  const searchParams = new URLSearchParams(location.search);
  const hostURL = searchParams.get(MFE_HOST_URL_PARAM) || location.ancestorOrigins?.[0] || document.referrer;
  if (hostURL) {
    return {
      origin: new URL(hostURL).origin,
      window: window.parent
    };
  }
  return {};
}
