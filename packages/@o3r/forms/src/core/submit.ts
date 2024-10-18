import {
  AbstractControl
} from '@angular/forms';
import {
  Observable
} from 'rxjs';

/**
 * Interface for the submittable component
 */
export interface Submittable {
  /**
   * Function call on submit action
   * This will commit and send the information relative to the component to the server
   */
  submit: () => Observable<boolean>;

  /**
   * Form group of the submittable component
   */
  formGroup: AbstractControl;
}
