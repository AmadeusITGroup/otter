/**
 * Model: GetTeamComponentSets200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedComponentSet } from '../published-component-set';
import { ResponseCursor } from '../response-cursor';

export interface GetTeamComponentSets200ResponseMeta {
  /** List of PublishedComponentSets */
  component_sets: PublishedComponentSet[];
  /** @see ResponseCursor */
  cursor?: ResponseCursor;
}


