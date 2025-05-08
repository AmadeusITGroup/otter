/**
 * Model: GetLibraryAnalyticsVariableActions200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsVariableActions200ResponseRows } from '../get-library-analytics-variable-actions200-response-rows';

export interface GetLibraryAnalyticsVariableActions200Response {
  /** @see GetLibraryAnalyticsVariableActions200ResponseRows */
  rows: GetLibraryAnalyticsVariableActions200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


