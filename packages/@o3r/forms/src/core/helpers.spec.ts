import {
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  getFlatControlErrors,
  markAllControlsDirtyAndTouched,
  markAllControlsPristineAndUntouched
} from './helpers';

describe('Form helpers', () => {
  describe('markAllControlsDirtyAndTouched and markAllControlsPristineAndUntouched', () => {
    let form: FormGroup<{
      first: FormControl<any>;
      last: FormControl<any>;
      subGroup: FormGroup<{
        day: FormControl<any>;
        month: FormControl<any>;
        year: FormControl<any>;
      }>;
    }>;

    beforeEach(() => {
      form = new FormGroup({
        first: new FormControl(),
        last: new FormControl(),
        subGroup: new FormGroup({
          day: new FormControl(),
          month: new FormControl(),
          year: new FormControl()
        })
      });
    });

    it('should have a pristine initial state', () => {
      const deepChild = form.controls.subGroup.controls.day;

      expect(form.controls.first.pristine).toBe(true);
      expect(deepChild.dirty).toBe(false);
      expect(deepChild.touched).toBe(false);
    });

    it('should mark a first level child as dirty/touched', () => {
      markAllControlsDirtyAndTouched(form);

      expect(form.controls.first.dirty).toBe(true);
      expect(form.controls.first.touched).toBe(true);
    });

    it('should mark a deep child as dirty/touched', () => {
      markAllControlsDirtyAndTouched(form);
      const deepChild = form.controls.subGroup.controls.month;

      expect(deepChild.dirty).toBe(true);
    });

    it('should mark a first level child as pristine/untouched', () => {
      markAllControlsDirtyAndTouched(form);

      expect(form.controls.first.pristine).toBe(false);
      expect(form.controls.first.untouched).toBe(false);
      markAllControlsPristineAndUntouched(form);

      expect(form.controls.first.pristine).toBe(true);
      expect(form.controls.first.untouched).toBe(true);
    });

    it('should mark a deep child as pristine/untouched', () => {
      markAllControlsDirtyAndTouched(form);
      const controlsKey = 'controls';
      const deepChild = form.controls.subGroup[controlsKey].month;

      expect(deepChild.pristine).toBe(false);
      markAllControlsPristineAndUntouched(form);

      expect(deepChild.pristine).toBe(true);
    });
  });

  describe('getFlatControlErrors', () => {
    let form: FormGroup;

    it('should return empty errors for valid form', () => {
      expect(getFlatControlErrors(new FormGroup({}))).toEqual([]);
    });

    it('should return the error of an invalid form with one error', () => {
      form = new FormGroup({});
      form.setErrors({ singleError: { expected: true, actual: false } });

      expect(getFlatControlErrors(form)).toEqual([{
        controlName: undefined,
        customErrors: null,
        errors: [{
          errorKey: 'singleError',
          errorValue: { expected: true, actual: false },
          validationError: { singleError: { expected: true, actual: false } }
        }]
      }]);
    });

    it('should return the customErrors of an invalid form', () => {
      form = new FormGroup({});
      form.setErrors({ customErrors: [{ translationKey: 'component.global.my-custom-validation' }] });

      expect(getFlatControlErrors(form)).toEqual([{
        controlName: undefined,
        customErrors: [{ translationKey: 'component.global.my-custom-validation' }],
        errors: []
      }]);
    });

    it('should separate validation errors from custom ones', () => {
      form = new FormGroup({});
      form.setErrors({
        singleError: { expected: true, actual: false },
        customErrors: [{ translationKey: 'component.global.my-custom-validation' }]
      });

      expect(getFlatControlErrors(form)).toEqual([{
        controlName: undefined,
        customErrors: [{ translationKey: 'component.global.my-custom-validation' }],
        errors: [{
          errorKey: 'singleError',
          errorValue: { expected: true, actual: false },
          validationError: { singleError: { expected: true, actual: false } }
        }]
      }]);
    });

    it('should return a flatten error list of an invalid form with multiple errors', () => {
      form = new FormGroup({});
      form.setErrors({
        singleError: { expected: true, actual: false },
        anotherError: 'SYSTEM_ERROR'
      });

      expect(getFlatControlErrors(form)).toEqual([{
        controlName: undefined,
        customErrors: null,
        errors: [{
          errorKey: 'singleError',
          errorValue: { expected: true, actual: false },
          validationError: { singleError: { expected: true, actual: false } }
        }, {
          errorKey: 'anotherError',
          errorValue: 'SYSTEM_ERROR',
          validationError: { anotherError: 'SYSTEM_ERROR' }
        }]
      }]);
    });

    it('should return empty errors for valid field', () => {
      form = new FormGroup({
        firstName: new FormControl()
      });

      expect(getFlatControlErrors(form)).toEqual([]);
    });

    it('should return the error of an invalid control with one error', () => {
      form = new FormGroup({
        firstName: new FormControl()
      });
      form.get('firstName').setErrors({ singleError: { expected: true, actual: false } });

      expect(getFlatControlErrors(form)).toEqual([
        {
          controlName: 'firstName',
          customErrors: null,
          errors: [{
            errorKey: 'singleError',
            errorValue: { expected: true, actual: false },
            validationError: { singleError: { expected: true, actual: false } }
          }]
        }
      ]);
    });

    it('should return errors from form and controls', () => {
      form = new FormGroup({
        firstName: new FormControl()
      });
      form.setErrors({ randomGlobalError: true });
      form.get('firstName').setErrors({ singleError: { expected: true, actual: false } });

      const errors = getFlatControlErrors(form);

      expect(errors).toContainEqual({
        controlName: undefined,
        customErrors: null,
        errors: [{
          errorKey: 'randomGlobalError',
          errorValue: true,
          validationError: { randomGlobalError: true }
        }]
      });

      expect(errors).toContainEqual({
        controlName: 'firstName',
        customErrors: null,
        errors: [{
          errorKey: 'singleError',
          errorValue: { expected: true, actual: false },
          validationError: { singleError: { expected: true, actual: false } }
        }]
      });
    });

    it('should return the error of an invalid control with multiple error', () => {
      form = new FormGroup({
        firstName: new FormControl()
      });
      form.get('firstName').setErrors({
        singleError: { expected: true, actual: false },
        anotherError: 'SYSTEM_ERROR'
      });

      expect(getFlatControlErrors(form)).toEqual([
        {
          controlName: 'firstName',
          customErrors: null,
          errors: [{
            errorKey: 'singleError',
            errorValue: { expected: true, actual: false },
            validationError: { singleError: { expected: true, actual: false } }
          }, {
            errorKey: 'anotherError',
            errorValue: 'SYSTEM_ERROR',
            validationError: { anotherError: 'SYSTEM_ERROR' }
          }]
        }
      ]);
    });

    it('should work for more than two levels', () => {
      form = new FormGroup({
        cardNumber: new FormControl(),
        expiryDate: new FormGroup({
          month: new FormControl(),
          year: new FormControl()
        })
      });

      form.setErrors({ error1: 10 });
      form.get('cardNumber').setErrors({ error2: 20 });
      form.get('expiryDate').setErrors({ error3: 30 });
      form.get('expiryDate').get('month').setErrors({ error4: 40 });

      expect(getFlatControlErrors(form)).toEqual([
        { // Global form
          controlName: undefined,
          customErrors: null,
          errors: [{
            errorKey: 'error1',
            errorValue: 10,
            validationError: { error1: 10 }
          }]
        },
        { // cardNumber
          controlName: 'cardNumber',
          customErrors: null,
          errors: [{
            errorKey: 'error2',
            errorValue: 20,
            validationError: { error2: 20 }
          }]
        },
        { // expiryDate
          controlName: 'expiryDate',
          customErrors: null,
          errors: [{
            errorKey: 'error3',
            errorValue: 30,
            validationError: { error3: 30 }
          }]
        },
        { // expiryDate.month
          controlName: 'expiryDate.month',
          customErrors: null,
          errors: [{
            errorKey: 'error4',
            errorValue: 40,
            validationError: { error4: 40 }
          }]
        }
      ]);
    });
  });
});
