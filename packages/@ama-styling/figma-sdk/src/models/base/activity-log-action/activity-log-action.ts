/**
 * Model: ActivityLogAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * The task or activity the actor performed.
 */
export interface ActivityLogAction {
  /** The type of the action. */
  type: string;
  /** Metadata of the action. Each action type supports its own metadata attributes. */
  details: { [key: string]: any; };
}


