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

export type ActionEnum = 'DELETE';
export type ResolvedTypeEnum = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

