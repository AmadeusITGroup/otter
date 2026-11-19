/**
 * Model: TextPathTypeStyle
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Hyperlink } from '../hyperlink';
import { Paint } from '../paint';
import { TextPathTypeStyleBoundVariables } from '../text-path-type-style-bound-variables';

export interface TextPathTypeStyle {
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
  /** Whether or not this style has overrides over a text style. The possible fields to override are semanticWeight, semanticItalic, and hyperlink. If this is true, then those fields are overrides if present. */
  isOverrideOverTextStyle?: boolean;
  /** @see TextPathTypeStyleBoundVariables */
  boundVariables?: TextPathTypeStyleBoundVariables;
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

