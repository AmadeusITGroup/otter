/**
 * Model: ActivityLogOrgEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma organization
 */
export interface ActivityLogOrgEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the organization. */
  id: string;
  /** Name of the organization. */
  name: string;
}

export type TypeEnum = 'org';

