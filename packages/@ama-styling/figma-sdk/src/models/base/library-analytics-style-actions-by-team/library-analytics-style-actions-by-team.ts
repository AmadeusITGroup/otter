/**
 * Model: LibraryAnalyticsStyleActionsByTeam
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Library analytics style action data broken down by team.
 */
export interface LibraryAnalyticsStyleActionsByTeam {
  /** The date in ISO 8601 format. e.g. 2023-12-13 */
  week: string;
  /** The name of the team using the library. */
  team_name: string;
  /** The name of the workspace that the team belongs to. */
  workspace_name?: string;
  /** The number of detach events for this period. */
  detachments: number;
  /** The number of insertion events for this period. */
  insertions: number;
}


