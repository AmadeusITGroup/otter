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
  /**
   * Whether or not text is italicized.
   * @default false
   */
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
  opentypeFlags?: Record<string, number>;
  /** Indicates how the font weight was overridden when there is a text style override. */
  semanticWeight?: SemanticWeightEnum;
  /** Indicates how the font style was overridden when there is a text style override. */
  semanticItalic?: SemanticItalicEnum;
  /**
   * Space between paragraphs in px, 0 if not present.
   * @default 0
   */
  paragraphSpacing?: number;
  /**
   * Paragraph indentation in px, 0 if not present.
   * @default 0
   */
  paragraphIndent?: number;
  /**
   * Space between list items in px, 0 if not present.
   * @default 0
   */
  listSpacing?: number;
  /**
   * Text decoration applied to the node, default is none.
   * @default 'NONE'
   */
  textDecoration?: TextDecorationEnum;
  /**
   * Dimensions along which text will auto resize, default is that the text does not auto-resize. TRUNCATE means that the text will be shortened and trailing text will be replaced with "…" if the text contents is larger than the bounds. `TRUNCATE` as a return value is deprecated and will be removed in a future version. Read from `textTruncation` instead.
   * @default 'NONE'
   */
  textAutoResize?: TextAutoResizeEnum;
  /**
   * Whether this text node will truncate with an ellipsis when the text contents is larger than the text node.
   * @default 'DISABLED'
   */
  textTruncation?: TextTruncationEnum;
  /** When `textTruncation: "ENDING"` is set, `maxLines` determines how many lines a text node can grow to before it truncates. */
  maxLines?: number;
  /** Line height in px. */
  lineHeightPx?: number;
  /**
   * Line height as a percentage of normal line height. This is deprecated; in a future version of the API only lineHeightPx and lineHeightPercentFontSize will be returned.
   * @default 100
   */
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

/** Array of TextCaseEnum items */
export const LIST_TEXT_CASE_ENUM = ['UPPER', 'LOWER', 'TITLE', 'SMALL_CAPS', 'SMALL_CAPS_FORCED'] as const;

/** List of available values for TextCaseEnum */
export type TextCaseEnum = 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
/** Array of TextAlignHorizontalEnum items */
export const LIST_TEXT_ALIGN_HORIZONTAL_ENUM = ['LEFT', 'RIGHT', 'CENTER', 'JUSTIFIED'] as const;

/** List of available values for TextAlignHorizontalEnum */
export type TextAlignHorizontalEnum = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
/** Array of TextAlignVerticalEnum items */
export const LIST_TEXT_ALIGN_VERTICAL_ENUM = ['TOP', 'CENTER', 'BOTTOM'] as const;

/** List of available values for TextAlignVerticalEnum */
export type TextAlignVerticalEnum = 'TOP' | 'CENTER' | 'BOTTOM';
/** Array of SemanticWeightEnum items */
export const LIST_SEMANTIC_WEIGHT_ENUM = ['BOLD', 'NORMAL'] as const;

/** List of available values for SemanticWeightEnum */
export type SemanticWeightEnum = 'BOLD' | 'NORMAL';
/** Array of SemanticItalicEnum items */
export const LIST_SEMANTIC_ITALIC_ENUM = ['ITALIC', 'NORMAL'] as const;

/** List of available values for SemanticItalicEnum */
export type SemanticItalicEnum = 'ITALIC' | 'NORMAL';
/** Array of TextDecorationEnum items */
export const LIST_TEXT_DECORATION_ENUM = ['NONE', 'STRIKETHROUGH', 'UNDERLINE'] as const;

/** List of available values for TextDecorationEnum */
export type TextDecorationEnum = 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE';
/** Array of TextAutoResizeEnum items */
export const LIST_TEXT_AUTO_RESIZE_ENUM = ['NONE', 'WIDTH_AND_HEIGHT', 'HEIGHT', 'TRUNCATE'] as const;

/** List of available values for TextAutoResizeEnum */
export type TextAutoResizeEnum = 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
/** Array of TextTruncationEnum items */
export const LIST_TEXT_TRUNCATION_ENUM = ['DISABLED', 'ENDING'] as const;

/** List of available values for TextTruncationEnum */
export type TextTruncationEnum = 'DISABLED' | 'ENDING';
/** Array of LineHeightUnitEnum items */
export const LIST_LINE_HEIGHT_UNIT_ENUM = ['PIXELS', 'FONT_SIZE_%', 'INTRINSIC_%'] as const;

/** List of available values for LineHeightUnitEnum */
export type LineHeightUnitEnum = 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';

