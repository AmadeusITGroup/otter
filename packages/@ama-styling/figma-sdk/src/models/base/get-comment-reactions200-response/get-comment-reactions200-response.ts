/**
 * Model: GetCommentReactions200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Reaction } from '../reaction';
import { ResponsePagination } from '../response-pagination';

export interface GetCommentReactions200Response {
  /** An array of reactions. */
  reactions: Reaction[];
  /** @see ResponsePagination */
  pagination: ResponsePagination;
}


