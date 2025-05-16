/**
 * Model: LibraryAnalyticsVariableActionsByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics variable actions data broken down by asset.
 */
export interface LibraryAnalyticsVariableActionsByAsset {
  /** The date in ISO 8601 format. e.g. 2023-12-13 */
  week: string;
  /** Unique, stable id of the variable. */
  variable_key: string;
  /** The name of the variable. */
  variable_name: string;
  /** The type of the variable. */
  variable_type: string;
  /** Unique, stable id of the collection the variable belongs to. */
  collection_key: string;
  /** The name of the collection the variable belongs to. */
  collection_name: string;
  /** The number of detach events for this period. */
  detachments: number;
  /** The number of insertion events for this period. */
  insertions: number;
}


