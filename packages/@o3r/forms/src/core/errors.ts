/** The error object saved in the store for a specific element/formControl */
export interface ErrorMessageObject {
  /**
   *  Translation key of the short error message (e.g. used for inline errors)
   *  @example
   *  translationKey = 'travelerForm.firstName.required'; => corresponds to {'travelerForm.firstName.required': 'First name is required!'} in localization json;
   */
  translationKey: string;

  /**
   * Translation key of the long error message (e.g. used on a message panel)
   * @example
   * longTranslationKey = 'travelerForm.firstName.required.long'; => corresponds to {'travelerForm.firstName.required.long': 'The first name in the registration form cannot be empty!'}
   * in localization json;
   */
  longTranslationKey?: string;

  /** Translation parameters of the error message; Used in the short message but also in the long message if needed */
  translationParams?: { [key: string]: any };

  /**
   * Original error object defined by the corresponding validator
   * @note It's optional since custom errors don't need to provide the validation error
   * @example
   * - {required: true}
   * - {max: {max 12, actual: 31}}
   */
  validationError?: {[key: string]: any};

  /**
   * An attribute which will be the combination of component name, form control name and the name of the error
   */
  code?: string;

  /**
   * English translation inline error message
   */
  title?: string;

  /**
   * The name of the formControl which gave the error
   */
  formControlName?: string;

  /**
   * The name of error
   */
  errorName?: string;
}

/** Error messages of the html element identified by it's id */
export interface ElementError {
  /** Id of the html element on which the validation has failed */
  htmlElementId: string;

  /** Element's error message objects */
  errorMessages: ErrorMessageObject[];
}

/** Form's error messages identified by form id */
export interface FormError {
  /** Id of the form containing the form field/fields */
  formId: string;

  /** Component's elements errors */
  errors: ElementError[];
}
