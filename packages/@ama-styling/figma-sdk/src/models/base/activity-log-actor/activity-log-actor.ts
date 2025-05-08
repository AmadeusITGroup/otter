/**
 * Model: ActivityLogActor
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * The user who performed the action.
 */
export interface ActivityLogActor {
  /** The type of the user. */
  type?: TypeEnum;
  /** The ID of the user. */
  id?: string;
  /** The name of the user. For SCIM events, the value is \"SCIM Provider\". For official support actions, the value is \"Figma Support\". */
  name: string;
  /** The email of the user. */
  email?: string;
}

export type TypeEnum = 'user';

