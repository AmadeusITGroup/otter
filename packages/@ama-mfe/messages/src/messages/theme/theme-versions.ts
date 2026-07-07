import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  THEME_MESSAGE_TYPE,
  ThemeStructure,
} from './base';

/**
 * Theme message object sent via communication protocol.
 * It contains the theme name and the theme deffinition
 */
export interface ThemeV1_0 extends VersionedMessage, ThemeStructure {
  /** The type of a theme message */
  type: typeof THEME_MESSAGE_TYPE;
  /** The version of this message */
  version: '1.0';
  /** Theme definition: css variables plus specific style */
  css: NonNullable<ThemeStructure['css']>;
}
