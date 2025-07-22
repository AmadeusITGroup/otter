import {
  ElementError,
  ErrorMessageObject,
  FormError,
} from '../../core/index';
import * as selectors from './form-error-messages.selectors';

describe('FormErrorMessages Selectors', () => {
  const errorMessageObject1: ErrorMessageObject = { translationKey: 'key1', translationParams: {}, validationError: { required: true } };
  const errorMessageObject2: ErrorMessageObject = { translationKey: 'key2', translationParams: {}, validationError: { date: 'invalid' } };
  const errorMessageObject3: ErrorMessageObject = { translationKey: 'key3', translationParams: { max: 12, actual: '22' }, validationError: { max: { max: 12, actual: '22' } } };
  const errorMessageObject4: ErrorMessageObject = { translationKey: 'key4', translationParams: {}, validationError: { global: 'forbidden' } };

  const elementError1: ElementError = { htmlElementId: 'elementId1', errorMessages: [errorMessageObject1, errorMessageObject2] };
  const elementError2: ElementError = { htmlElementId: 'elementId2', errorMessages: [errorMessageObject3] };
  const elementError3: ElementError = { htmlElementId: 'elementId3', errorMessages: [errorMessageObject4] };

  const formError1: FormError = { formId: 'formId1', errors: [elementError1, elementError2] };
  const formError2: FormError = { formId: 'formId2', errors: [elementError3] };

  it('should provide all the element errors', () => {
    const formErrors = [formError1, formError2];

    expect(selectors.selectAllElementErrors.projector(formErrors)).toEqual([elementError1, elementError2, elementError3]);
    expect(selectors.selectAllElementErrors.projector([])).toEqual([]);
    expect(selectors.selectAllElementErrors.projector(undefined)).toEqual([]);
  });

  it('should provide all the error message objetcs', () => {
    const elementErrors = [elementError1, elementError2, elementError3];

    expect(selectors.selectAllErrorMessageObjects.projector(elementErrors)).toEqual([errorMessageObject1, errorMessageObject2, errorMessageObject3, errorMessageObject4]);
    expect(selectors.selectAllErrorMessageObjects.projector([])).toEqual([]);
    expect(selectors.selectAllErrorMessageObjects.projector(undefined)).toEqual([]);
  });
});
