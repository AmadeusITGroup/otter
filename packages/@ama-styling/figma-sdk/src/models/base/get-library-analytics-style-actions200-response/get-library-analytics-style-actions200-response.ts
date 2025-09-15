/**
 * Model: GetLibraryAnalyticsStyleActions200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsStyleActions200ResponseRows } from '../get-library-analytics-style-actions200-response-rows';

export interface GetLibraryAnalyticsStyleActions200Response {
  /** @see GetLibraryAnalyticsStyleActions200ResponseRows */
  rows: GetLibraryAnalyticsStyleActions200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


