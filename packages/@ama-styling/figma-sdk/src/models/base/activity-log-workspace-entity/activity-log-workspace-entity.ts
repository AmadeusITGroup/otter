/**
 * Model: ActivityLogWorkspaceEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Part of the organizational hierarchy of managing files and users within Figma, only available on the Enterprise Plan
 */
export interface ActivityLogWorkspaceEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the workspace. */
  id: string;
  /** Name of the workspace. */
  name: string;
}

export type TypeEnum = 'workspace';

