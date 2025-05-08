/**
 * Model: GetLocalVariables200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LocalVariable } from '../local-variable';
import { LocalVariableCollection } from '../local-variable-collection';

export interface GetLocalVariables200ResponseMeta {
  /** A map of variable ids to variables */
  variables: { [key: string]: LocalVariable; };
  /** A map of variable collection ids to variable collections */
  variableCollections: { [key: string]: LocalVariableCollection; };
}


