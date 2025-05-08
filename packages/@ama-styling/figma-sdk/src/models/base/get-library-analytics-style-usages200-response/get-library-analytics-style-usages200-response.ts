/**
 * Model: GetLibraryAnalyticsStyleUsages200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsStyleUsages200ResponseRows } from '../get-library-analytics-style-usages200-response-rows';

export interface GetLibraryAnalyticsStyleUsages200Response {
  /** @see GetLibraryAnalyticsStyleUsages200ResponseRows */
  rows: GetLibraryAnalyticsStyleUsages200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


