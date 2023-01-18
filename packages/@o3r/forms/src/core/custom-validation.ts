import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ErrorMessageObject } from './errors';

/**
 * The return of a custom validation
 */
export interface CustomErrors {
  /** The custom errors coming from a validation fn */
  customErrors: ErrorMessageObject[];
}

/** Custom validation function */
export type CustomValidationFn = (control: AbstractControl) => CustomErrors | null;

/** Custom async validation function */
export type AsyncCustomValidationFn = (control: AbstractControl) => Observable<CustomErrors | null> | Promise<CustomErrors | null>;

/** Custom validation functions for each field of T model */
export type CustomFieldsValidation<T> = { [K in keyof T]?: CustomValidationFn };

/** Custom async validation function for each field of T model  */
export type AsyncCustomFieldsValidation<T> = { [K in keyof T]?: AsyncCustomValidationFn };

/** Custom validation for the form */
export interface CustomFormValidation<T> {
  /** Validation for each field */
  fields?: CustomFieldsValidation<T>;
  /** Global validation for the form */
  global?: CustomValidationFn;
}

/**
 * Custom async validation for the form
 */
export interface AsyncCustomFormValidation<T> {
  /** Validation for each field */
  fields?: AsyncCustomFieldsValidation<T>;
  /** Global validation for the form */
  global?: AsyncCustomValidationFn;
}
