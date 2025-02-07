import type {
  Message,
} from '../message-to-remove';
import type {
  MESSAGE_RESIZE_TYPE,
} from './base';

/**
 * The resize message object sent via the communication protocol
 * Used in microfrontend architecture based on iframes.
 * The iframes height is fix and does not change automatically if the content inside it changes.
 * This message contain the height of the content of an iframe and is sent to the parent of the iframe, so the parent can adjust the height of the iframe.
 * This will avoid a scroll bar on the iframe. If there will be a scroll bar that will be only on the parent
 */
export interface Resize extends Message {
  /** The type of a resize message */
  type: typeof MESSAGE_RESIZE_TYPE;
  /** The version of this message */
  version: '1.0';
  /** The height in pixels of the content of the iframe */
  height: number;
}
