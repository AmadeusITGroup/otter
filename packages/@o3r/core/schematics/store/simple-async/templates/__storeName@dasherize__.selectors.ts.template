import { createFeatureSelector, createSelector} from '@ngrx/store';
import { <%= scuStoreName %>_STORE_NAME, <%= storeName %>State } from './<%= fileName %>.state';

/** Select <%= storeName %> State */
export const select<%= storeName %>State = createFeatureSelector<<%= storeName %>State>(<%= scuStoreName %>_STORE_NAME);

/** Select <%= storeName %> isPending status */
export const select<%= storeName %>IsPendingStatus = createSelector(select<%= storeName %>State, (state) => !!state.isPending);

/** Select <%= storeName %> isFailure status */
export const select<%= storeName %>IsFailureStatus = createSelector(select<%= storeName %>State, (state) => !!state.isFailure);
