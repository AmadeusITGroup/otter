/**
 * Model: PublishedVariableCollection
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A grouping of related Variable objects each with the same modes.
 */
export interface PublishedVariableCollection {
  /** The unique identifier of this variable collection. */
  id: string;
  /** The ID of the variable collection that is used by subscribing files. This ID changes every time the variable collection is modified and published. */
  subscribed_id: string;
  /** The name of this variable collection. */
  name: string;
  /** The key of this variable collection. */
  key: string;
  /** The UTC ISO 8601 time at which the variable collection was last updated.  This timestamp will change any time a variable in the collection is changed. */
  updatedAt: string;
}


