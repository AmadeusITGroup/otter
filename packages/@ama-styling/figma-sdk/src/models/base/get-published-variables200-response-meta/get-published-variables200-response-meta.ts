/**
 * Model: GetPublishedVariables200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedVariable } from '../published-variable';
import { PublishedVariableCollection } from '../published-variable-collection';

export interface GetPublishedVariables200ResponseMeta {
  /** A map of variable ids to variables */
  variables: { [key: string]: PublishedVariable; };
  /** A map of variable collection ids to variable collections */
  variableCollections: { [key: string]: PublishedVariableCollection; };
}


