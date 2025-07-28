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

export type TypeEnum = 'team';

