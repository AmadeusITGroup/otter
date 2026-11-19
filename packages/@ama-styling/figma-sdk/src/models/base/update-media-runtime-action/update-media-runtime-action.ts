/**
 * Model: UpdateMediaRuntimeAction
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { UpdateMediaRuntimeActionOneOf } from '../update-media-runtime-action-one-of';
import { UpdateMediaRuntimeActionOneOf1 } from '../update-media-runtime-action-one-of1';
import { UpdateMediaRuntimeActionOneOf2 } from '../update-media-runtime-action-one-of2';

/**
 * An action that affects a video node in the Figma viewer. For example, to play, pause, or skip.
 */
export type UpdateMediaRuntimeAction = UpdateMediaRuntimeActionOneOf | UpdateMediaRuntimeActionOneOf1 | UpdateMediaRuntimeActionOneOf2;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['UPDATE_MEDIA_RUNTIME'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'UPDATE_MEDIA_RUNTIME';
/** Array of MediaActionEnum items */
export const LIST_MEDIA_ACTION_ENUM = ['SKIP_TO'] as const;

/** List of available values for MediaActionEnum */
export type MediaActionEnum = 'SKIP_TO';

