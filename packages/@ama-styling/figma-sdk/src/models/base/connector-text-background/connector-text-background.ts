/**
 * Model: ConnectorTextBackground
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Paint } from '../paint';

export interface ConnectorTextBackground {
  /** Radius of each corner if a single radius is set for all corners */
  cornerRadius?: number;
  /** A value that lets you control how \"smooth\" the corners are. Ranges from 0 to 1. 0 is the default and means that the corner is perfectly circular. A value of 0.6 means the corner matches the iOS 7 \"squircle\" icon shape. Other values produce various other curves. */
  cornerSmoothing?: number;
  /** Array of length 4 of the radius of each corner of the frame, starting in the top left and proceeding clockwise.  Values are given in the order top-left, top-right, bottom-right, bottom-left. */
  rectangleCornerRadii?: number[];
  /** An array of fill paints applied to the node. */
  fills: Paint[];
  /** A mapping of a StyleType to style ID (see Style) of styles present on this node. The style ID can be used to look up more information about the style in the top-level styles field. */
  styles?: { [key: string]: string; };
}


