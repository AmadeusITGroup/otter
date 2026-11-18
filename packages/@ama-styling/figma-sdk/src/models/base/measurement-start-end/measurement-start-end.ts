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

/** Array of SideEnum items */
export const LIST_SIDE_ENUM = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'] as const;

/** List of available values for SideEnum */
export type SideEnum = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

