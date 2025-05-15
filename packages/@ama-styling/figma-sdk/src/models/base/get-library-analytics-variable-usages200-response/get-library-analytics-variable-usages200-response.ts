/**
 * Model: GetLibraryAnalyticsVariableUsages200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsVariableUsages200ResponseRows } from '../get-library-analytics-variable-usages200-response-rows';

export interface GetLibraryAnalyticsVariableUsages200Response {
  /** @see GetLibraryAnalyticsVariableUsages200ResponseRows */
  rows: GetLibraryAnalyticsVariableUsages200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


