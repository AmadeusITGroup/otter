/**
 * Model: VariableModeChange
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableModeCreate } from '../variable-mode-create';
import { VariableModeDelete } from '../variable-mode-delete';
import { VariableModeUpdate } from '../variable-mode-update';

export type VariableModeChange = VariableModeCreate | VariableModeDelete | VariableModeUpdate;

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';

