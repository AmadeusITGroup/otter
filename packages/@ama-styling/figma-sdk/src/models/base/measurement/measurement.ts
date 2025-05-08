/**
 * Model: Measurement
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { MeasurementOffset } from '../measurement-offset';
import { MeasurementStartEnd } from '../measurement-start-end';

/**
 * A pinned distance between two nodes in Dev Mode
 */
export interface Measurement {
  id: string;
  /** @see MeasurementStartEnd */
  start: MeasurementStartEnd;
  /** @see MeasurementStartEnd */
  end: MeasurementStartEnd;
  /** @see MeasurementOffset */
  offset: MeasurementOffset;
  /** When manually overridden, the displayed value of the measurement */
  freeText?: string;
}


