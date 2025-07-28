/**
 * Model: LibraryAnalyticsStyleUsagesByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics style usage data broken down by component.
 */
export interface LibraryAnalyticsStyleUsagesByAsset {
  /** Unique, stable id of the style. */
  style_key: string;
  /** The name of the style. */
  style_name: string;
  /** The type of the style. */
  style_type: string;
  /** The number of usages of the style within the organization. */
  usages: number;
  /** The number of teams using the style within the organization. */
  teams_using: number;
  /** The number of files using the style within the organization. */
  files_using: number;
}


