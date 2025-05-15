/**
 * Model: PaintOverride
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Paint } from '../paint';

/**
 * Paint metadata to override default paints.
 */
export interface PaintOverride {
  /** Paints applied to characters. */
  fills?: Paint[];
  /** ID of style node, if any, that this inherits fill data from. */
  inheritFillStyleId?: string;
}


