import { createFeatureSelector, createSelector } from '@ngrx/store';
import { placeholderTemplateAdapter } from './placeholder-template.reducer';
import { PLACEHOLDER_TEMPLATE_STORE_NAME, PlaceholderTemplateState } from './placeholder-template.state';

const {selectIds, selectEntities, selectAll, selectTotal} = placeholderTemplateAdapter.getSelectors();

export const selectPlaceholderTemplateState = createFeatureSelector<PlaceholderTemplateState>(PLACEHOLDER_TEMPLATE_STORE_NAME);

/** Select the array of PlaceholderTemplate ids */
export const selectPlaceholderTemplateIds = createSelector(selectPlaceholderTemplateState, (state) => state && selectIds(state));

/** Select the array of PlaceholderTemplate */
export const selectAllPlaceholderTemplate = createSelector(selectPlaceholderTemplateState, (state) => state && selectAll(state));

/** Select the dictionary of PlaceholderTemplate entities */
export const selectPlaceholderTemplateEntities = createSelector(selectPlaceholderTemplateState, (state) => state && selectEntities(state));

/** Select the total PlaceholderTemplate count */
export const selectPlaceholderTemplateTotal = createSelector(selectPlaceholderTemplateState, (state) => state && selectTotal(state));

/** Select the store pending status */
export const selectPlaceholderTemplateStorePendingStatus = createSelector(selectPlaceholderTemplateState, (state) => state?.isPending || false);

/** Select a specific PlaceholderTemplate */
export const selectPlaceholderTemplateEntity =
  createSelector(selectPlaceholderTemplateState, (state: PlaceholderTemplateState | undefined, props: { id: string }) => state?.entities[props.id]);

/** Select urls that already have the template retrieved and computed*/
export const selectPlaceholderTemplateUrls = createSelector(selectPlaceholderTemplateEntities, (entities) => entities ? Object.values(entities).map((entity) => entity?.url) : []);
