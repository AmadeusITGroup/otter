/**
 * Model: ActivityLogProjectEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A project that a collection of Figma files are grouped under
 */
export interface ActivityLogProjectEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the project. */
  id: string;
  /** Name of the project. */
  name: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['project'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'project';

