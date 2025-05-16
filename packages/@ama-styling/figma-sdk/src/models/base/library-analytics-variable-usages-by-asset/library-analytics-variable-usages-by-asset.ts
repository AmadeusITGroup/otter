/**
 * Model: LibraryAnalyticsVariableUsagesByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics variable usage data broken down by component.
 */
export interface LibraryAnalyticsVariableUsagesByAsset {
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
  /** The number of usages of the variable within the organization. */
  usages: number;
  /** The number of teams using the variable within the organization. */
  teams_using: number;
  /** The number of files using the variable within the organization. */
  files_using: number;
}


