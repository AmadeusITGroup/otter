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

export type TypeEnum = 'project';

