/**
 * Model: LibraryAnalyticsStyleActionsByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics style actions data broken down by asset.
 */
export interface LibraryAnalyticsStyleActionsByAsset {
  /** The date in ISO 8601 format. e.g. 2023-12-13 */
  week: string;
  /** Unique, stable id of the style. */
  style_key: string;
  /** The name of the style. */
  style_name: string;
  /** The type of the style. */
  style_type: string;
  /** The number of detach events for this period. */
  detachments: number;
  /** The number of insertion events for this period. */
  insertions: number;
}


