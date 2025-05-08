/**
 * Model: GetLibraryAnalyticsComponentActions200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsComponentActions200ResponseRows } from '../get-library-analytics-component-actions200-response-rows';

export interface GetLibraryAnalyticsComponentActions200Response {
  /** @see GetLibraryAnalyticsComponentActions200ResponseRows */
  rows: GetLibraryAnalyticsComponentActions200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


