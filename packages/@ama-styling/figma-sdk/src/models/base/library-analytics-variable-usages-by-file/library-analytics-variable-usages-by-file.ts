/**
 * Model: LibraryAnalyticsVariableUsagesByFile
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics variable usage data broken down by file.
 */
export interface LibraryAnalyticsVariableUsagesByFile {
  /** The name of the file using the library. */
  file_name: string;
  /** The name of the team the file belongs to. */
  team_name: string;
  /** The name of the workspace that the file belongs to. */
  workspace_name?: string;
  /** The number of times variables from this library are used within the file. */
  usages: number;
}


