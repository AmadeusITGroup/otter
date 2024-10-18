import {
  AbstractControl,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';

export abstract class ExtendedValidator implements Validator {
  /**
   * Full list of validator functions
   */
  public abstract validators: ValidatorFn[];

  /**
   * Apply the list of validators on a specific Control
   * @param control
   */
  public validate(control: AbstractControl): ValidationErrors | null {
    const errors = Object.assign({}, ...this.validators.map((validatorFunctions) => validatorFunctions(control)));

    return Object.keys(errors).length > 0 ? errors : null;
  }
}
