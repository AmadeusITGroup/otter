/**
 * Model: VariableCollectionChange
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableCollectionCreate } from '../variable-collection-create';
import { VariableCollectionDelete } from '../variable-collection-delete';
import { VariableCollectionUpdate } from '../variable-collection-update';

export type VariableCollectionChange = VariableCollectionCreate | VariableCollectionDelete | VariableCollectionUpdate;

/** Array of ActionEnum items */
export const LIST_ACTION_ENUM = ['DELETE'] as const;

/** List of available values for ActionEnum */
export type ActionEnum = 'DELETE';

