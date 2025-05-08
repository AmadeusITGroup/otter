/**
 * Model: LibraryAnalyticsComponentActionsByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics component actions data broken down by asset.
 */
export interface LibraryAnalyticsComponentActionsByAsset {
  /** The date in ISO 8601 format. e.g. 2023-12-13 */
  week: string;
  /** Unique, stable id of the component. */
  component_key: string;
  /** Name of the component. */
  component_name: string;
  /** Unique, stable id of the component set that this component belongs to. */
  component_set_key?: string;
  /** Name of the component set that this component belongs to. */
  component_set_name?: string;
  /** The number of detach events for this period. */
  detachments: number;
  /** The number of insertion events for this period. */
  insertions: number;
}


