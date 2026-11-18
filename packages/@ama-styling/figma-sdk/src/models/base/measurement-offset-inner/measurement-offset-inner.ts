/**
 * Model: MeasurementOffsetInner
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Measurement offset relative to the inside of the start node
 */
export interface MeasurementOffsetInner {
  /** @see TypeEnum */
  type: TypeEnum;
  relative: number;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['INNER'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'INNER';

