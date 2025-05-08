/**
 * Model: ActivityLogFileRepoEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A file branch that diverges from and can be merged back into the main file
 */
export interface ActivityLogFileRepoEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the file branch. */
  id: string;
  /** Name of the file. */
  name: string;
  /** Key of the main file. */
  main_file_key: string;
}

export type TypeEnum = 'file_repo';

