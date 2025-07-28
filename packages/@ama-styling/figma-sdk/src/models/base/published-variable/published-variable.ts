/**
 * Model: PublishedVariable
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Variable is a single design token that defines values for each of the modes in its VariableCollection. These values can be applied to various kinds of design properties.
 */
export interface PublishedVariable {
  /** The unique identifier of this variable. */
  id: string;
  /** The ID of the variable that is used by subscribing files. This ID changes every time the variable is modified and published. */
  subscribed_id: string;
  /** The name of this variable. */
  name: string;
  /** The key of this variable. */
  key: string;
  /** The id of the variable collection that contains this variable. */
  variableCollectionId: string;
  /** The resolved type of the variable. */
  resolvedDataType: ResolvedDataTypeEnum;
  /** The UTC ISO 8601 time at which the variable was last updated. */
  updatedAt: string;
}

export type ResolvedDataTypeEnum = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

