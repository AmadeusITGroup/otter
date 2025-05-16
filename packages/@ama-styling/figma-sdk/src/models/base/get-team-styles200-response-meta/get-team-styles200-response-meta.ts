/**
 * Model: GetTeamStyles200ResponseMeta
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PublishedStyle } from '../published-style';
import { ResponseCursor } from '../response-cursor';

export interface GetTeamStyles200ResponseMeta {
  /** List of PublishedStyles */
  styles: PublishedStyle[];
  /** @see ResponseCursor */
  cursor?: ResponseCursor;
}


