import type {
  Message,
} from '@amadeus-it-group/microfrontends';
import type {
  MESSAGE_THEME_TYPE,
} from './base';

/**
 * Theme message object sent via communication protocol.
 * It contains the theme name and the theme deffinition
 */
export interface Theme extends Message {
  /** The type of a theme message */
  type: typeof MESSAGE_THEME_TYPE;
  /** The version of this message */
  version: '1.0';
  /** The theme identification name */
  name: string;
  /** Theme definition: css variables plus specific style */
  theme: string;
}
