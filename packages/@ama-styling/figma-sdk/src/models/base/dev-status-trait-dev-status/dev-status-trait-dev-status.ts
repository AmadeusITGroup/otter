/**
 * Model: DevStatusTraitDevStatus
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Represents whether or not a node has a particular handoff (or dev) status applied to it.
 */
export interface DevStatusTraitDevStatus {
  /** @see TypeEnum */
  type: TypeEnum;
  /** An optional field where the designer can add more information about the design and what has changed. */
  description?: string;
}

export type TypeEnum = 'NONE' | 'READY_FOR_DEV' | 'COMPLETED';

