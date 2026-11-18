/**
 * Model: UpdateMediaRuntimeActionOneOf1
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An action that updates the runtime of a media node by skipping forward or backward.  The `destinationId` is the node ID of the media node to update. If `destinationId` is `null`, the action will update the media node that contains the action.  The `mediaAction` is the action to perform on the media node.  The `amountToSkip` is the amount of time to skip in seconds.
 */
export interface UpdateMediaRuntimeActionOneOf1 {
  /** @see TypeEnum */
  type: TypeEnum;
  destinationId?: string;
  /** @see MediaActionEnum */
  mediaAction: MediaActionEnum;
  amountToSkip: number;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['UPDATE_MEDIA_RUNTIME'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'UPDATE_MEDIA_RUNTIME';
/** Array of MediaActionEnum items */
export const LIST_MEDIA_ACTION_ENUM = ['SKIP_FORWARD', 'SKIP_BACKWARD'] as const;

/** List of available values for MediaActionEnum */
export type MediaActionEnum = 'SKIP_FORWARD' | 'SKIP_BACKWARD';

