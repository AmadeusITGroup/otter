/**
 * Model: ColorStop
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ColorStopBoundVariables } from '../color-stop-bound-variables';
import { RGBA } from '../r-g-b-a';

/**
 * A single color stop with its position along the gradient axis, color, and bound variables if any
 */
export interface ColorStop {
  /** Value between 0 and 1 representing position along gradient axis. */
  position: number;
  /** @see RGBA */
  color: RGBA;
  /** @see ColorStopBoundVariables */
  boundVariables?: ColorStopBoundVariables;
}


