/**
 * Model: UpdateMediaRuntimeActionOneOf2
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An action that updates the runtime of a media node by skipping to a specific time.  The `destinationId` is the node ID of the media node to update. If `destinationId` is `null`, the action will update the media node that contains the action.  The `mediaAction` is the action to perform on the media node.  The `newTimestamp` is the new time to skip to in seconds.
 */
export interface UpdateMediaRuntimeActionOneOf2 {
  /** @see TypeEnum */
  type: TypeEnum;
  destinationId?: string;
  /** @see MediaActionEnum */
  mediaAction: MediaActionEnum;
  newTimestamp: number;
}

export type TypeEnum = 'UPDATE_MEDIA_RUNTIME';
export type MediaActionEnum = 'SKIP_TO';

