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

export type FormatEnum = 'JPG' | 'PNG' | 'SVG' | 'PDF';

