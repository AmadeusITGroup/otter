import {createFeatureSelector, createSelector} from '@ngrx/store';
import {PLACEHOLDER_REQUEST_STORE_NAME, PlaceholderRequestState} from './placeholder-request.state';
import {placeholderRequestAdapter} from './placeholder-request.reducer';

export const selectPlaceholderRequestState = createFeatureSelector<PlaceholderRequestState>(PLACEHOLDER_REQUEST_STORE_NAME);

const {selectEntities} = placeholderRequestAdapter.getSelectors();

/** Select the dictionary of PlaceholderRequest entities */
export const selectPlaceholderRequestEntities = createSelector(selectPlaceholderRequestState, (state) => state && selectEntities(state));

/**
 * Select a specific PlaceholderRequest entity using a raw url as id
 * @param rawUrl
 */
export const selectPlaceholderRequestEntityUsage = (rawUrl: string) => createSelector(
  selectPlaceholderRequestState,
  (state) => {
    return state?.entities[rawUrl] ? state.entities[rawUrl].used : undefined;
  });
