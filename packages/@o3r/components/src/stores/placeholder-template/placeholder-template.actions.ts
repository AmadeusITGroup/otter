import {createAction, props} from '@ngrx/store';
import { SetEntityActionPayload} from '@o3r/core';
import {PlaceholderTemplateModel} from './placeholder-template.state';

const ACTION_DELETE_ENTITY = '[PlaceholderTemplate] delete entity';
const ACTION_SET_ENTITY = '[PlaceholderTemplate] set entity';

/** Action to delete a specific entity */
export const deletePlaceholderTemplateEntity = createAction(ACTION_DELETE_ENTITY, props<{ id: string }>());

/** Action to clear all placeholderTemplate and fill the store with the payload */
export const setPlaceholderTemplateEntity = createAction(ACTION_SET_ENTITY, props<SetEntityActionPayload<PlaceholderTemplateModel>>());
