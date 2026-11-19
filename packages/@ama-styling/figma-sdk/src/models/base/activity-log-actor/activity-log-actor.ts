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
  /** The name of the user. For SCIM events, the value is "SCIM Provider". For official support actions, the value is "Figma Support". */
  name: string;
  /** The email of the user. */
  email?: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['user'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'user';

