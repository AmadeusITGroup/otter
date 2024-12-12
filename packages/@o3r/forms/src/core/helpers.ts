import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import {
  ControlFlatErrors,
  FlatError,
} from './flat-errors';

/**
 * Checks if controls is a FormGroup
 * @param control
 */
export function isFormGroup(control: AbstractControl): control is FormGroup {
  return Object.prototype.hasOwnProperty.call(control, 'controls');
}

/**
 * Mark the controls in the given form as touched and dirty
 * @param control
 */
export function markAllControlsDirtyAndTouched(control: AbstractControl) {
  control.markAsDirty({ onlySelf: true });
  control.markAsTouched({ onlySelf: true });
  if (isFormGroup(control)) {
    Object.keys(control.controls).forEach((controlName) => {
      const currentControl = control.get(controlName);
      if (currentControl) {
        markAllControlsDirtyAndTouched(currentControl);
      }
    });
  }
}

/**
 * Mark the controls in the given form as untouched and pristine
 * @param control
 */
export function markAllControlsPristineAndUntouched(control: AbstractControl) {
  control.markAsUntouched({ onlySelf: true });
  control.markAsPristine({ onlySelf: true });
  if (isFormGroup(control)) {
    Object.keys(control.controls).forEach((controlName) => {
      const currentControl = control.get(controlName);
      if (currentControl) {
        markAllControlsPristineAndUntouched(currentControl);
      }
    });
  }
}

/**
 * Transforms ValidationErrors object into an array of FlatErrors.
 * @note It filters out the 'customErrors'
 * @param errors Validation errors in a control
 */
const getErrorList = (errors: ValidationErrors): FlatError[] => {
  return Object.keys(errors)
    .filter((errorKey) => errorKey !== 'customErrors')
    .map((errorKey) => {
      const errorValue = errors[errorKey];
      return {
        errorKey,
        errorValue,
        validationError: { [errorKey]: errorValue }
      };
    });
};

/**
 * Gets a flat list of all the errors in the form and it's descendents
 * @param form Form to be checked
 */
export function getFlatControlErrors(form: AbstractControl) {
  /**
   * Get a ControlFlatError of the control (or form) containing the name of the control, the validations errors and custom errors
   * @param control the control to be analyzed
   * @param controlName the name of the control. Optional since forms do not have names
   */
  const getControlErrors = (control: AbstractControl, controlName?: string): ControlFlatErrors => {
    return {
      controlName,
      customErrors: (control.errors && control.errors.customErrors) || null,
      errors: control.errors ? getErrorList(control.errors) : []
    };
  };

  /**
   * Recursion to get all the flat errors from the control and its descendents
   * @param control the control to be analyzed
   * @param controlName the name of the control. Optional since forms do not have names
   */
  const recursiveControlErrors = (control: AbstractControl, controlName?: string): ControlFlatErrors[] => {
    const controlErrors = [getControlErrors(control, controlName)];
    if (isFormGroup(control)) {
      return Object.keys(control.controls).reduce((allErrors, childControlName) => {
        const childName = controlName ? `${controlName}.${childControlName}` : childControlName;
        return allErrors.concat(
          recursiveControlErrors(control.get(childControlName)!, `${childName}`)
        );
      }, controlErrors);
    }
    return controlErrors;
  };

  return recursiveControlErrors(form).filter((errors) => !!errors.customErrors || errors.errors.length > 0);
}
