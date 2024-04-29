import {createFeatureSelector, createSelector} from '@ngrx/store';
import {petstoreAdapter} from './petstore.reducer';
import {PETSTORE_STORE_NAME, PetstoreState} from './petstore.state';

const {selectIds, selectEntities, selectAll, selectTotal} = petstoreAdapter.getSelectors();

/** Select Petstore State */
export const selectPetstoreState = createFeatureSelector<PetstoreState>(PETSTORE_STORE_NAME);

/** Select the array of Petstore ids */
export const selectPetstoreIds = createSelector(selectPetstoreState, selectIds);

/** Select the array of Petstore */
export const selectAllPetstore = createSelector(selectPetstoreState, selectAll);

/** Select the dictionary of Petstore entities */
export const selectPetstoreEntities = createSelector(selectPetstoreState, selectEntities);

/** Select the total Petstore count */
export const selectPetstoreTotal = createSelector(selectPetstoreState, selectTotal);

/** Select the store pending status */
export const selectPetstoreStorePendingStatus = createSelector(selectPetstoreState, (state) => state.isPending || false);

/** Select the store pending status */
export const selectPetstoreStoreFailingStatus = createSelector(selectPetstoreState, (state) => state.isFailure || false);
