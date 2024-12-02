import {
  EntityState,
} from '@ngrx/entity';
import {
  FormError,
} from '../../core/index';

/**
 * FormError model
 */
export interface FormErrorModel extends FormError {

}

/**
 * FormError store state
 */
export interface FormErrorMessagesState extends EntityState<FormErrorModel> {}

/**
 * Name of the FormError Store
 */
export const FORM_ERROR_MESSAGES_STORE_NAME = 'formErrorMessages';

/**
 * FormError Store Interface
 */
export interface FormErrorMessagesStore {
  /** FormErrorMessages state */
  [FORM_ERROR_MESSAGES_STORE_NAME]: FormErrorMessagesState;
}
