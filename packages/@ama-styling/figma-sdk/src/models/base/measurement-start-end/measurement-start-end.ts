/**
 * Model: MeasurementStartEnd
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * The node and side a measurement is pinned to
 */
export interface MeasurementStartEnd {
  nodeId: string;
  /** @see SideEnum */
  side: SideEnum;
}

export type SideEnum = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

