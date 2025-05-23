/**
 * Model: GetFileVersions200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ResponsePagination } from '../response-pagination';
import { Version } from '../version';

export interface GetFileVersions200Response {
  /** An array of versions. */
  versions: Version[];
  /** @see ResponsePagination */
  pagination: ResponsePagination;
}


