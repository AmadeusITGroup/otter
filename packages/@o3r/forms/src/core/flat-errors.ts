import { ValidationErrors } from '@angular/forms';
import { ErrorMessageObject } from './errors';

/** Flat representation of Angular's ValidationError */
export interface FlatError {
  /** The key that identifies the validation error */
  errorKey: string;
  /** The value linked to the validation error */
  errorValue: any;
  /** The original validation error */
  validationError: ValidationErrors;
}

/**
 * Represents all errors (validation or custom ones) from a control.
 * Useful for working with form errors
 *
 * @note The control may be form, therefore the controlName may be undefined
 */
export interface ControlFlatErrors {
  /**
   * The name of a field. e.g firstName, cardNumber. If it's a form, should be undefined
   *
   * @note For child fields, use [parentControlName].[fieldName]. e.g expiryDate.month
   */
  controlName?: string;
  /** List of customErrors (coming from custom validation) linked to the control */
  customErrors?: ErrorMessageObject[] | null;
  /** The list of flatten errors linked to the control */
  errors: FlatError[];
}
