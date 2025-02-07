import type {
  Message,
} from '../message-to-remove';
import type {
  MESSAGE_NAVIGATION_TYPE,
} from './base';

/**
 * The navigation message object sent via the communication protocol.
 * Used in microfrontend architecture based on iframes where an iframe change its url and notify its parent with the url change
 * The parent should update its own url with the information received in order to allow the refresh and the deep link share
 */
export interface Navigation extends Message {
  /** The type of a navigation message */
  type: typeof MESSAGE_NAVIGATION_TYPE;
  /** The version of this message */
  version: '1.0';
  /** The url updated */
  url: string;
}
