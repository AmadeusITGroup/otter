/**
 * Model: Interaction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Action } from '../action';
import { Trigger } from '../trigger';

/**
 * An interaction in the Figma viewer, containing a trigger and one or more actions.
 */
export interface Interaction {
  /** @see Trigger */
  trigger: Trigger;
  /** The actions that are performed when the trigger is activated. */
  actions?: Action[];
}


