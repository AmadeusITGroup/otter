import {createFeatureSelector, createSelector} from '@ngrx/store';
import {<%= cStoreName %>Adapter} from './<%= fileName %>.reducer';
import {<%= scuStoreName %>_STORE_NAME, <%= storeName %>State} from './<%= fileName %>.state';

const {selectIds, selectEntities, selectAll, selectTotal} = <%= cStoreName %>Adapter.getSelectors();

/** Select <%= storeName %> State */
export const select<%= storeName %>State = createFeatureSelector<<%= storeName %>State>(<%= scuStoreName %>_STORE_NAME);

/** Select the array of <%= storeName %> ids */
export const select<%= storeName %>Ids = createSelector(select<%= storeName %>State, selectIds);

/** Select the array of <%= storeName %> */
export const selectAll<%= storeName %> = createSelector(select<%= storeName %>State, selectAll);

/** Select the dictionary of <%= storeName %> entities */
export const select<%= storeName %>Entities = createSelector(select<%= storeName %>State, selectEntities);

/** Select the total <%= storeName %> count */
export const select<%= storeName %>Total = createSelector(select<%= storeName %>State, selectTotal);
