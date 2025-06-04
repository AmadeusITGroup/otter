/**
 * Model: GetLibraryAnalyticsComponentUsages200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GetLibraryAnalyticsComponentUsages200ResponseRows } from '../get-library-analytics-component-usages200-response-rows';

export interface GetLibraryAnalyticsComponentUsages200Response {
  /** @see GetLibraryAnalyticsComponentUsages200ResponseRows */
  rows: GetLibraryAnalyticsComponentUsages200ResponseRows;
  /** Whether there is a next page of data that can be fetched. */
  next_page: boolean;
  /** The cursor to use to fetch the next page of data. Not present if next_page is false. */
  cursor?: string;
}


