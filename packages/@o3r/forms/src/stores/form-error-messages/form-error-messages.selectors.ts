import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import {
  ElementError,
  ErrorMessageObject,
} from '../../core/index';
import {
  formErrorMessagesAdapter,
} from './form-error-messages.reducer';
import {
  FORM_ERROR_MESSAGES_STORE_NAME,
  FormErrorMessagesState,
} from './form-error-messages.state';

const { selectIds, selectEntities, selectAll, selectTotal } = formErrorMessagesAdapter.getSelectors();

/** Select FormErrorMessages State */
export const selectFormErrorMessagesState = createFeatureSelector<FormErrorMessagesState>(FORM_ERROR_MESSAGES_STORE_NAME);

/** Select the array of FormErrorMessages ids */
export const selectFormErrorMessagesIds = createSelector(selectFormErrorMessagesState, selectIds);

/** Select the array of FormErrorMessages */
export const selectAllFormErrorMessages = createSelector(selectFormErrorMessagesState, selectAll);

/** Select the dictionary of FormErrorMessages entities */
export const selectFormErrorMessagesEntities = createSelector(selectFormErrorMessagesState, selectEntities);

/** Select the total FormErrorMessages count */
export const selectFormErrorMessagesTotal = createSelector(selectFormErrorMessagesState, selectTotal);

/** Select the array of all ElementErrors */
export const selectAllElementErrors = createSelector(
  selectAllFormErrorMessages,
  (formErrorMessages) => formErrorMessages ? formErrorMessages.reduce((elementErrors: ElementError[], formErrorMessage) => [...elementErrors, ...formErrorMessage.errors], []) : []
);

/** Select the array of all ErrorMessageObjects */
export const selectAllErrorMessageObjects = createSelector(
  selectAllElementErrors,
  (elementErrors) => elementErrors ? elementErrors.reduce((errorMessageObjects: ErrorMessageObject[], elementError: ElementError) => [...errorMessageObjects, ...elementError.errorMessages], []) : []
);
