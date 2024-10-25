import type {
  OtterMessageContent
} from '@o3r/core';

/**
 * Payload of the {@see PlaceholderLoadingStatusMessage}
 *
 * Describe the state of an identified placeholder: what template is being loaded and whether the load is done
 */
export interface PlaceholderLoadingStatus {
  /**
   * Ids of the template to be loaded in the placeholder
   */
  templateIds?: string[];
  /**
   * Identify the placeholder under consideration
   */
  placeholderId?: string;
}

/**
 * Message to describe a placeholder's loading status: the templates to be loaded and the pending status.
 */
export interface PlaceholderLoadingStatusMessage extends PlaceholderLoadingStatus,
  OtterMessageContent<'placeholder-loading-status'> {}
