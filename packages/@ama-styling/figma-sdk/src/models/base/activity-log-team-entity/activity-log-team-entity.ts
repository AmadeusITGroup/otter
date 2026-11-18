/**
 * Model: ActivityLogTeamEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma team that contains multiple users and projects
 */
export interface ActivityLogTeamEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the team. */
  id: string;
  /** Name of the team. */
  name: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['team'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'team';

