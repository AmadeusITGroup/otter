import {
  formatDate,
} from '@angular/common';
import {
  AbstractControl,
} from '@angular/forms';
import {
  CustomErrors,
  CustomValidationFn,
} from '@o3r/forms';

/**
 * Validator which checks that the name is not equal with the parameter 'valueToTest'
 * @param valueToTest
 * @param translationKey
 * @param longTranslationKey
 * @param translationParams
 */
export function formsParentValidatorGlobal(valueToTest: string, translationKey: string, longTranslationKey?: string, translationParams?: any): CustomValidationFn {
  return (control: AbstractControl): CustomErrors | null => {
    const value = control.value;
    if (!value || !value.name) {
      return null;
    }
    return value.name === valueToTest ? { customErrors: [{ translationKey, longTranslationKey, translationParams }] } : null;
  };
}

/**
 * Validator which checks that the date of birth is not in the future
 * @param translationKey
 * @param longTranslationKey
 * @param translationParams
 */
export function dateCustomValidator(translationKey: string, longTranslationKey?: string, translationParams?: any): CustomValidationFn {
  return (control: AbstractControl): CustomErrors | null => {
    const value: string = formatDate(control.value, 'yyyy-MM-dd', 'en-GB');
    if (!value) {
      return null;
    }

    return value <= formatDate(Date.now(), 'yyyy-MM-dd', 'en-GB') ? null : { customErrors: [{ translationKey, longTranslationKey, translationParams }] };
  };
}
