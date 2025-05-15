/**
 * Model: LibraryAnalyticsComponentUsagesByFile
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics component usage data broken down by file.
 */
export interface LibraryAnalyticsComponentUsagesByFile {
  /** The name of the file using the library. */
  file_name: string;
  /** The name of the team the file belongs to. */
  team_name: string;
  /** The name of the workspace that the file belongs to. */
  workspace_name?: string;
  /** The number of component instances from the library used within the file. */
  usages: number;
}


