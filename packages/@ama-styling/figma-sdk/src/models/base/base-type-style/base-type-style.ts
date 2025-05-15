/**
 * Model: BaseTypeStyle
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Hyperlink } from '../hyperlink';
import { Paint } from '../paint';

export interface BaseTypeStyle {
  /** Font family of text (standard name). */
  fontFamily?: string;
  /** PostScript font name. */
  fontPostScriptName?: string;
  /** Describes visual weight or emphasis, such as Bold or Italic. */
  fontStyle?: string;
  /** Whether or not text is italicized. */
  italic?: boolean;
  /** Numeric font weight. */
  fontWeight?: number;
  /** Font size in px. */
  fontSize?: number;
  /** Text casing applied to the node, default is the original casing. */
  textCase?: TextCaseEnum;
  /** Horizontal text alignment as string enum. */
  textAlignHorizontal?: TextAlignHorizontalEnum;
  /** Vertical text alignment as string enum. */
  textAlignVertical?: TextAlignVerticalEnum;
  /** Space between characters in px. */
  letterSpacing?: number;
  /** An array of fill paints applied to the characters. */
  fills?: Paint[];
  /** @see Hyperlink */
  hyperlink?: Hyperlink;
  /** A map of OpenType feature flags to 1 or 0, 1 if it is enabled and 0 if it is disabled. Note that some flags aren't reflected here. For example, SMCP (small caps) is still represented by the `textCase` field. */
  opentypeFlags?: { [key: string]: number; };
  /** Indicates how the font weight was overridden when there is a text style override. */
  semanticWeight?: SemanticWeightEnum;
  /** Indicates how the font style was overridden when there is a text style override. */
  semanticItalic?: SemanticItalicEnum;
}

export type TextCaseEnum = 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
export type TextAlignHorizontalEnum = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
export type TextAlignVerticalEnum = 'TOP' | 'CENTER' | 'BOTTOM';
export type SemanticWeightEnum = 'BOLD' | 'NORMAL';
export type SemanticItalicEnum = 'ITALIC' | 'NORMAL';

