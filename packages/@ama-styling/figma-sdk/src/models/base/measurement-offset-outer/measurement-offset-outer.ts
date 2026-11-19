/**
 * Model: MeasurementOffsetOuter
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Measurement offset relative to the outside of the start node
 */
export interface MeasurementOffsetOuter {
  /** @see TypeEnum */
  type: TypeEnum;
  fixed: number;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['OUTER'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'OUTER';

