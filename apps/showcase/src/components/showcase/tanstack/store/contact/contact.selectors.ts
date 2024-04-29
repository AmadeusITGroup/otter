import {createFeatureSelector, createSelector} from '@ngrx/store';
import {contactAdapter} from './contact.reducer';
import {CONTACT_STORE_NAME, ContactState} from './contact.state';

const {selectIds, selectEntities, selectAll, selectTotal} = contactAdapter.getSelectors();

/** Select Contact State */
export const selectContactState = createFeatureSelector<ContactState>(CONTACT_STORE_NAME);

/** Select the array of Contact ids */
export const selectContactIds = createSelector(selectContactState, selectIds);

/** Select the array of Contact */
export const selectAllContact = createSelector(selectContactState, selectAll);

/** Select the dictionary of Contact entities */
export const selectContactEntities = createSelector(selectContactState, selectEntities);

/** Select the total Contact count */
export const selectContactTotal = createSelector(selectContactState, selectTotal);

/** Select the store pending status */
export const selectContactStorePendingStatus = createSelector(selectContactState, (state) => state.isPending || false);

export const selectContactStoreFailureStatus = createSelector(selectContactState, (state) => state.isFailure || false);

