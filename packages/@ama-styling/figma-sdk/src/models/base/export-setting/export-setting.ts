/**
 * Model: ExportSetting
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Constraint } from '../constraint';

/**
 * An export setting.
 */
export interface ExportSetting {
  suffix: string;
  /** @see FormatEnum */
  format: FormatEnum;
  /** @see Constraint */
  constraint: Constraint;
}

/** Array of FormatEnum items */
export const LIST_FORMAT_ENUM = ['JPG', 'PNG', 'SVG', 'PDF'] as const;

/** List of available values for FormatEnum */
export type FormatEnum = 'JPG' | 'PNG' | 'SVG' | 'PDF';

