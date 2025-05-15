/**
 * Model: TypeStyle
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Hyperlink } from '../hyperlink';
import { Paint } from '../paint';
import { TypeStyleBoundVariables } from '../type-style-bound-variables';

export interface TypeStyle {
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
  /** Space between paragraphs in px, 0 if not present. */
  paragraphSpacing?: number;
  /** Paragraph indentation in px, 0 if not present. */
  paragraphIndent?: number;
  /** Space between list items in px, 0 if not present. */
  listSpacing?: number;
  /** Text decoration applied to the node, default is none. */
  textDecoration?: TextDecorationEnum;
  /** Dimensions along which text will auto resize, default is that the text does not auto-resize. TRUNCATE means that the text will be shortened and trailing text will be replaced with \"…\" if the text contents is larger than the bounds. `TRUNCATE` as a return value is deprecated and will be removed in a future version. Read from `textTruncation` instead. */
  textAutoResize?: TextAutoResizeEnum;
  /** Whether this text node will truncate with an ellipsis when the text contents is larger than the text node. */
  textTruncation?: TextTruncationEnum;
  /** When `textTruncation: \"ENDING\"` is set, `maxLines` determines how many lines a text node can grow to before it truncates. */
  maxLines?: number;
  /** Line height in px. */
  lineHeightPx?: number;
  /** Line height as a percentage of normal line height. This is deprecated; in a future version of the API only lineHeightPx and lineHeightPercentFontSize will be returned. */
  lineHeightPercent?: number;
  /** Line height as a percentage of the font size. Only returned when `lineHeightPercent` (deprecated) is not 100. */
  lineHeightPercentFontSize?: number;
  /** The unit of the line height value specified by the user. */
  lineHeightUnit?: LineHeightUnitEnum;
  /** Whether or not this style has overrides over a text style. The possible fields to override are semanticWeight, semanticItalic, hyperlink, and textDecoration. If this is true, then those fields are overrides if present. */
  isOverrideOverTextStyle?: boolean;
  /** @see TypeStyleBoundVariables */
  boundVariables?: TypeStyleBoundVariables;
}

export type TextCaseEnum = 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
export type TextAlignHorizontalEnum = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
export type TextAlignVerticalEnum = 'TOP' | 'CENTER' | 'BOTTOM';
export type SemanticWeightEnum = 'BOLD' | 'NORMAL';
export type SemanticItalicEnum = 'ITALIC' | 'NORMAL';
export type TextDecorationEnum = 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE';
export type TextAutoResizeEnum = 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
export type TextTruncationEnum = 'DISABLED' | 'ENDING';
export type LineHeightUnitEnum = 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';

