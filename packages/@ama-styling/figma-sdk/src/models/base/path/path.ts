/**
 * Model: Path
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Defines a single path
 */
export interface Path {
  /** A series of path commands that encodes how to draw the path. */
  path: string;
  /** The winding rule for the path (same as in SVGs). This determines whether a given point in space is inside or outside the path. */
  windingRule: WindingRuleEnum;
  /** If there is a per-region fill, this refers to an ID in the `fillOverrideTable`. */
  overrideID?: number;
}

export type WindingRuleEnum = 'NONZERO' | 'EVENODD';

