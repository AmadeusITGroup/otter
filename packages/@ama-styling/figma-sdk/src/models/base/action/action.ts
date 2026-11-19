/**
 * Model: Action
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ActionOneOf } from '../action-one-of';
import { ConditionalAction } from '../conditional-action';
import { NodeAction } from '../node-action';
import { OpenURLAction } from '../open-u-r-l-action';
import { SetVariableAction } from '../set-variable-action';
import { SetVariableModeAction } from '../set-variable-mode-action';
import { UpdateMediaRuntimeAction } from '../update-media-runtime-action';

/**
 * An action that is performed when a trigger is activated.
 */
export type Action = ActionOneOf | ConditionalAction | NodeAction | OpenURLAction | SetVariableAction | SetVariableModeAction | UpdateMediaRuntimeAction;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['BACK', 'CLOSE', 'URL', 'UPDATE_MEDIA_RUNTIME', 'SET_VARIABLE', 'SET_VARIABLE_MODE', 'CONDITIONAL', 'NODE'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'BACK' | 'CLOSE' | 'URL' | 'UPDATE_MEDIA_RUNTIME' | 'SET_VARIABLE' | 'SET_VARIABLE_MODE' | 'CONDITIONAL' | 'NODE';
/** Array of MediaActionEnum items */
export const LIST_MEDIA_ACTION_ENUM = ['SKIP_TO'] as const;

/** List of available values for MediaActionEnum */
export type MediaActionEnum = 'SKIP_TO';

