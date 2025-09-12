/** The theme message type used by communication protocol */
export const THEME_MESSAGE_TYPE = 'theme';

/** Object containing the name of a theme and the theme definition (css vars plus specific style) */
export interface ThemeStructure {
  /** The name of the theme. Ex: 'dark', 'blue' ... */
  name: string;
  /** CSS text containing the theme definition */
  css: string | null;
}
