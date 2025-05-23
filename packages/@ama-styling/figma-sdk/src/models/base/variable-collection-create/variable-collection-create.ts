/**
 * Model: VariableCollectionCreate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object that contains details about creating a `VariableCollection`.
 */
export interface VariableCollectionCreate {
  /** The action to perform for the variable collection. */
  action: ActionEnum;
  /** A temporary id for this variable collection. */
  id?: string;
  /** The name of this variable collection. */
  name: string;
  /** The initial mode refers to the mode that is created by default. You can set a temporary id here, in order to reference this mode later in this request. */
  initialModeId?: string;
  /** Whether this variable collection is hidden when publishing the current file as a library. */
  hiddenFromPublishing?: boolean;
}

export type ActionEnum = 'CREATE';

