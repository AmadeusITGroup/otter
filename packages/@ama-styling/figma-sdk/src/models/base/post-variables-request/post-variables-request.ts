/**
 * Model: PostVariablesRequest
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableChange } from '../variable-change';
import { VariableCollectionChange } from '../variable-collection-change';
import { VariableModeChange } from '../variable-mode-change';
import { VariableModeValue } from '../variable-mode-value';

export interface PostVariablesRequest {
  /** For creating, updating, and deleting variable collections. */
  variableCollections?: VariableCollectionChange[];
  /** For creating, updating, and deleting modes within variable collections. */
  variableModes?: VariableModeChange[];
  /** For creating, updating, and deleting variables. */
  variables?: VariableChange[];
  /** For setting a specific value, given a variable and a mode. */
  variableModeValues?: VariableModeValue[];
}


