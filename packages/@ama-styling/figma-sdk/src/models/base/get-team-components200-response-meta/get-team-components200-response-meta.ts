/**
 * Model: GetTeamComponents200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedComponent } from '../published-component';
import { ResponseCursor } from '../response-cursor';

export interface GetTeamComponents200ResponseMeta {
  /** List of PublishedComponents */
  components: PublishedComponent[];
  /** @see ResponseCursor */
  cursor?: ResponseCursor;
}


