/**
 * Model: VariableChange
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableCreate } from '../variable-create';
import { VariableDelete } from '../variable-delete';
import { VariableUpdate } from '../variable-update';

export type VariableChange = VariableCreate | VariableDelete | VariableUpdate;

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';
/** Array of ResolvedTypeEnum items */
export const LIST_RESOLVED_TYPE_ENUM = ['BOOLEAN', 'FLOAT', 'STRING', 'COLOR'] as const;

/** List of available values for ResolvedTypeEnum */
export type ResolvedTypeEnum = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

