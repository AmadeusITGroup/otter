/**
 * Model: WebhookLibraryPublishPayload
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LibraryItemData } from '../library-item-data';
import { User } from '../user';

export interface WebhookLibraryPublishPayload {
  /** The passcode specified when the webhook was created, should match what was initially provided */
  passcode: string;
  /** UTC ISO 8601 timestamp of when the event was triggered. */
  timestamp: string;
  /** The id of the webhook that caused the callback */
  webhook_id: string;
  /** @see EventTypeEnum */
  event_type: EventTypeEnum;
  /** Components that were created by the library publish */
  created_components: LibraryItemData[];
  /** Styles that were created by the library publish */
  created_styles: LibraryItemData[];
  /** Variables that were created by the library publish */
  created_variables: LibraryItemData[];
  /** Components that were modified by the library publish */
  modified_components: LibraryItemData[];
  /** Styles that were modified by the library publish */
  modified_styles: LibraryItemData[];
  /** Variables that were modified by the library publish */
  modified_variables: LibraryItemData[];
  /** Components that were deleted by the library publish */
  deleted_components: LibraryItemData[];
  /** Styles that were deleted by the library publish */
  deleted_styles: LibraryItemData[];
  /** Variables that were deleted by the library publish */
  deleted_variables: LibraryItemData[];
  /** Description of the library publish */
  description?: string;
  /** The key of the file that was published */
  file_key: string;
  /** The name of the file that was published */
  file_name: string;
  /** @see LibraryItemData */
  library_item: LibraryItemData;
  /** @see User */
  triggered_by: User;
}

export type EventTypeEnum = 'LIBRARY_PUBLISH';

