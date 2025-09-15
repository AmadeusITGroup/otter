/**
 * Model: UpdateMediaRuntimeActionOneOf
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An action that updates the runtime of a media node by playing, pausing, toggling play/pause, muting, unmuting, or toggling mute/unmute.  The `destinationId` is the node ID of the media node to update. If `destinationId` is `null`, the action will update the media node that contains the action.  The `mediaAction` is the action to perform on the media node.
 */
export interface UpdateMediaRuntimeActionOneOf {
  /** @see TypeEnum */
  type: TypeEnum;
  destinationId: string;
  /** @see MediaActionEnum */
  mediaAction: MediaActionEnum;
}

export type TypeEnum = 'UPDATE_MEDIA_RUNTIME';
export type MediaActionEnum = 'PLAY' | 'PAUSE' | 'TOGGLE_PLAY_PAUSE' | 'MUTE' | 'UNMUTE' | 'TOGGLE_MUTE_UNMUTE';

