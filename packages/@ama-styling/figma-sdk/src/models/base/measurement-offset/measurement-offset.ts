/**
 * Model: MeasurementOffset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { MeasurementOffsetInner } from '../measurement-offset-inner';
import { MeasurementOffsetOuter } from '../measurement-offset-outer';

export type MeasurementOffset = MeasurementOffsetInner | MeasurementOffsetOuter;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['INNER', 'OUTER'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'INNER' | 'OUTER';

