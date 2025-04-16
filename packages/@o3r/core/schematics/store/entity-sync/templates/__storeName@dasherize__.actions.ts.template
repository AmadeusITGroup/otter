<% if (hasSDK) {%>import {<%= payloadModelName %>} from '<%= sdkPackage %>';
<% } %>import {createAction, props} from '@ngrx/store';
import {SetActionPayload, SetEntitiesActionPayload, UpdateActionPayload, UpdateEntitiesActionPayload<% if(!hasCustomId) {%>WithId<% } %>} from '@o3r/core';
<% if (!hasSDK) {%>import {<%= payloadModelName %>} from './<%= fileName %>.state';
<% } %>import {<%= storeName %>StateDetails} from './<%= fileName %>.state';

/** StateDetailsActions */
const ACTION_SET = '[<%= storeName %>] set';
const ACTION_UPDATE = '[<%= storeName %>] update';
const ACTION_RESET = '[<%= storeName %>] reset';

/** Entity Actions */
const ACTION_CLEAR_ENTITIES = '[<%= storeName %>] clear entities';
const ACTION_UPDATE_ENTITIES = '[<%= storeName %>] update entities';
const ACTION_UPSERT_ENTITIES = '[<%= storeName %>] upsert entities';
const ACTION_SET_ENTITIES = '[<%= storeName %>] set entities';

/**
 * Clear the StateDetails of the store and replace it.
 */
export const set<%= storeName %> = createAction(ACTION_SET, props<SetActionPayload<<%= storeName %>StateDetails>>());

/**
 * Change a part or the whole object in the store.
 */
export const update<%= storeName %> = createAction(ACTION_UPDATE, props<UpdateActionPayload<<%= storeName %>StateDetails>>());

/**
 * Action to reset the whole state, by returning it to initial state.
 */
export const reset<%= storeName %> = createAction(ACTION_RESET);

/**
 * Clear all <%= cStoreName %> and fill the store with the payload
 */
export const set<%= storeName %>Entities = createAction(ACTION_SET_ENTITIES, props<SetEntitiesActionPayload<<%= payloadModelName %>>>());

/**
 * Update <%= cStoreName %> with known IDs, ignore the new ones
 */
export const update<%= storeName %>Entities = createAction(ACTION_UPDATE_ENTITIES, props<UpdateEntitiesActionPayload<% if(!hasCustomId) {%>WithId<% } %><<%= payloadModelName %><% if(hasCustomId) {%>, '<%=modelIdPropName%>'<% } %>>>());

/**
 * Update <%= cStoreName %> with known IDs, insert the new ones
 */
export const upsert<%= storeName %>Entities = createAction(ACTION_UPSERT_ENTITIES, props<SetEntitiesActionPayload<<%= payloadModelName %>>>());

/**
 * Clear only the entities, keeps the other attributes in the state
 */
export const clear<%= storeName %>Entities = createAction(ACTION_CLEAR_ENTITIES);
