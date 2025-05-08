/**
 * Model: ActivityLogUserEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma user
 */
export interface ActivityLogUserEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique stable id of the user. */
  id: string;
  /** Name of the user. */
  name: string;
  /** Email associated with the user's account. */
  email: string;
}

export type TypeEnum = 'user';

