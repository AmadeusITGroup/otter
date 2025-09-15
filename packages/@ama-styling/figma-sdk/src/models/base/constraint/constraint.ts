/**
 * Model: Constraint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Sizing constraint for exports.
 */
export interface Constraint {
  /** Type of constraint to apply:  - `SCALE`: Scale by `value`. - `WIDTH`: Scale proportionally and set width to `value`. - `HEIGHT`: Scale proportionally and set height to `value`. */
  type: TypeEnum;
  /** See type property for effect of this field. */
  value: number;
}

export type TypeEnum = 'SCALE' | 'WIDTH' | 'HEIGHT';

