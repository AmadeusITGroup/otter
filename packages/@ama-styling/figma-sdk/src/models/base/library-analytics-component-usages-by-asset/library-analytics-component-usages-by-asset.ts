/**
 * Model: LibraryAnalyticsComponentUsagesByAsset
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics component usage data broken down by component.
 */
export interface LibraryAnalyticsComponentUsagesByAsset {
  /** Unique, stable id of the component. */
  component_key: string;
  /** Name of the component. */
  component_name: string;
  /** Unique, stable id of the component set that this component belongs to. */
  component_set_key?: string;
  /** Name of the component set that this component belongs to. */
  component_set_name?: string;
  /** The number of instances of the component within the organization. */
  usages: number;
  /** The number of teams using the component within the organization. */
  teams_using: number;
  /** The number of files using the component within the organization. */
  files_using: number;
}


