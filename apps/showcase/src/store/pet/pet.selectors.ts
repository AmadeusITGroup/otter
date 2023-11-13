import {createFeatureSelector, createSelector} from '@ngrx/store';
import {petAdapter} from './pet.reducer';
import {PET_STORE_NAME, PetState} from './pet.state';

const {selectIds, selectEntities, selectAll, selectTotal} = petAdapter.getSelectors();

/** Select Pet State */
export const selectPetState = createFeatureSelector<PetState>(PET_STORE_NAME);

/** Select the array of Pet ids */
export const selectPetIds = createSelector(selectPetState, selectIds);

/** Select the array of Pet */
export const selectAllPet = createSelector(selectPetState, selectAll);

/** Select the dictionary of Pet entities */
export const selectPetEntities = createSelector(selectPetState, selectEntities);

/** Select the total Pet count */
export const selectPetTotal = createSelector(selectPetState, selectTotal);

/** Select the store pending status */
export const selectPetStorePendingStatus = createSelector(selectPetState, (state) => state.isPending || false);

/** Select the store failure status */
export const selectPetStoreFailureStatus = createSelector(selectPetState, (state) => state.isFailure || false);
