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

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['workspace'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'workspace';

