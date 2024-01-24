[Form errors](#introduction)

- [Form errors](#form-errors)
    - [Form error store](#form-error-store)
      - [Error object model](#error-object-model)
    - [Creating error object](#creating-error-object)
      - [Custom errors](#custom-errors)
      - [Basic/primitive errors](#basicprimitive-errors)
      - [Build error messages](#build-error-messages)
    - [Display inline error messages](#display-inline-error-messages)
      - [Basic errors](#basic-errors)
      - [Custom errors](#custom-errors-1)
    - [Add errors to the store](#add-errors-to-the-store)
    - [Errors translation definition](#errors-translation-definition)
      - [Custom errors](#custom-errors-2)
      - [Primitive errors](#primitive-errors)

<a name="introduction"></a>

# Form errors

Handling the form errors in Otter context (container/presenter, localization ...), it's a bit different from creating a form in a component and do all the logic there.
<a name="store"></a>

### Form error store

To have the possibility to display inline error messages in the form and also in error panels (on the top of the page, above submit button ...) the best match is to have a dedicated store for the form errors. In this way we can listen to the store state and display the errors anywhere in the page.
The store is provided in __@o3r/forms__ package. See [Form Error Store](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/stores/form-error-messages/form-error-messages.state.ts) for more details and state object model.
<a name="errormodel"></a>

#### Error object model

The store model object is __FormError__. See below the form errors object models.

- The __FormError__ contains an identifier for each component which has a form inside, plus the errors associated to that form.

```typescript
/** Form's error messages identified by form id */
export interface FormError {
  /** Id of the form containing the form field/fields */
  formId: string;

  /** Component's elements errors */
  errors: ElementError[];
}
```

- __ElementError__
This object contains all the errors associated to the html element.
The identifier __htmlElementId__ can be used as an anchor link to focus on the html element on which the validation has failed

```typescript
/** Error messages of the html element identified by its id */
export interface ElementError {
  /** Id of the html element on which the validation has failed */
  htmlElementId: string;

  /** Element's error message objects */
  errorMessages: ErrorMessageObject[];
}
```

- __ErrorMessageObject__
  - associated to an error message on a field.
  - It will contain:
    - __translationKey__ for the error message
    - __longTranslationKey__ used for a more detailed message on the same error
    - __translationParams__ translations parameters
    - __validationError__ original error object

```typescript
/** The error object saved in the store for a specific element/formControl */
export interface ErrorMessageObject {
  /**
   *  Translation key of the short error message (e.g. used for inline errors)
   *  @example
   *  ```typescript
   *  translationKey = 'travelerForm.firstName.required'; // => corresponds to {'travelerForm.firstName.required': 'First name is required!'} in localization json;
   *  ```
   */
  translationKey: string;

  /**
   * Translation key of the long error message (e.g. used on a message panel)
   * @example
   * ```typescript
   * longTranslationKey = 'travelerForm.firstName.required.long'; // => corresponds to {'travelerForm.firstName.required.long': 'The first name in the registration form cannot be empty!'}
   * // in localization json;
   * ```
   *
   */
  longTranslationKey?: string;

  /** Translation parameters of the error message; Used in the short message but also in the long message if needed */
  translationParams?: { [key: string]: any };

    /**
   * Original error object defined by the corresponding validator
   * @note It's optional since custom errors don't need to provide the validation error
   * @example
   * ```typescript
   * {required: true}
   * ```
   * @example
   * ```typescript
   * {max: {max 12, actual: 31}}
   * ```
   */
  validationError?: {[key: string]: any};
}
```

<a name="createerror"></a>

### Creating error object

The presenter has to implement the [Validator](https://angular.io/api/forms/NG_VALIDATORS) or [AsyncValidator](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) in order to give us the possibility to define the error object which will be returned by the form.
The error message structure will be defined in the implementation of __validate__ method.
As __validate__ function should return a [ValidationErrors](https://angular.io/api/forms/ValidationErrors) object, which is a map of custom objects (with type _any_), we can prepare the returned object for the store of error messages. This will ease the process of adding the errors in the store.
We have to make sure that we are providing the __htmlElementId__ for the errors in the store which is matching the __html field__.
For this, the presenter is receiving an __id__ as input and for each field we are concatenating the __id__ with the __formControlName__. As the container is setting a __unique id__ we are sure that we have uniques html ids for the form fields.
The object returned by the __validate__ is the error object which is propagated to the container.

There are 2 types of validators (see [Form Validation](./FORM_VALIDATION.md)), 2 categories of error messages:

- one for __custom errors__ - set on the container
- one for __primitive errors__ - computed in the presenter.

<a name="customerrors"></a>

#### Custom errors

They are returned by __custom validators__ and have the type [CustomErrors](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/custom-validation.ts) defined in __@o3r/forms__.
This one is using _customErrors_ key with an array of __ErrorMessageObject__ which has to contain all the custom errors for a form control or group.

```typescript
/**
 * The return of a custom validation
 */
export interface CustomErrors {
  /** The custom errors coming from a validation fn */
  customErrors: ErrorMessageObject[];
}
```

Error object model returned by the validator has to be compliant with the store model.

```typescript
// Example of returned object by the custom validator
{customErrors: [{translationKey, longTranslationKey, translationParams}]};
```

<a name="basicerrors"></a>

#### Basic/primitive errors

The error object structure has to be created in the presenter because the __basic validators__ are defined at presenter level (see [FORM_VALIDATION](./FORM_VALIDATION.md)).

<a name="builderror"></a>

#### Build error messages

We put in place a generic helper [__getFlatControlErrors__](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/core/helpers.ts) in __@o3r/forms__.
This gets a flattened list of all the errors in the form and it's descendants, concatenating the __custom errors__; The object returned by the helper has [ControlFlatErrors](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/core/flat-errors.ts) type.

```typescript
/**
 * Represents all errors (validation or custom ones) from a control.
 * Useful for working with form errors
 * @note The control may be form, therefore the controlName may be undefined
 */
export interface ControlFlatErrors {
  /** The name of a field. e.g firstName, cardNumber. If it's a form, should be undefined
   * @note For child fields, use [parentControlName].[fieldName]. e.g expiryDate.month
   */
  controlName?: string;
  /** List of customErrors (coming from custom validation) linked to the control */
  customErrors?: ErrorMessageObject[] | null;
  /** The list of flatten errors linked to the control */
  errors: FlatError[];
}
```

Example of __validate__ method implementation

```typescript
/// ----> in the presenter class
import { ControlFlatErrors, CustomFormValidation, FlatError, getFlatControlErrors } from '@o3r/forms';
...

export class FormsPocPresComponent implements OnInit, Validator, FormsPocPresContext, ControlValueAccessor, Configurable<FormsPocPresConfig>, OnDestroy {

    /**
     * Localization of the component
     */
    @Input()
    @Localization('./forms-poc-pres.localization.json')
    public translations: FormsPocPresTranslation;

    /** Object used to compute the ids of the form controls */
    @Input() id: string;

    componentSelector: string = 'o3r-forms-poc-pres';

    travelerForm: FormGroup;

    constructor(config: FormsPocPresConfig, private fb: FormBuilder, protected changeDetector: ChangeDetectorRef) {
      this.config = config;
      this.translations = translations;
      // Create the form with no initial values
      this.travelerForm = this.fb.group({
        firstName: null,
        lastName: null,
        dateOfBirth: null
      });
    }

  /**
   * Return the errors for the validators applied global to the form plus the errors for each field
   *
   * @inheritDoc
   */
  public validate(_control: AbstractControl): ValidationErrors | null {
    if (this.travelerForm.status === 'VALID') {
      return null;
    }

    const formErrors = getFlatControlErrors(this.travelerForm);  // ---> use the helper to get the flat list of errors for the form

    const errors = formErrors.reduce((errorsMap: ValidationErrors, controlFlatErrors: ControlFlatErrors) => {
      return {
        // ...errorsMap,
        [controlFlatErrors.controlName || 'global']: { // ---> use the 'global' key for the errors applied on the root form
          htmlElementId: `${this.id}${controlFlatErrors.controlName || ''}`, // ---> The html id of the element
          errorMessages: (controlFlatErrors.customErrors || []).concat( // ---> errors associated to the html element ( custom errors plus basic ones )
            controlFlatErrors.errors.map((error) => {
              // Translation key creation
              // As the primitive errors are linked to the presenter we use the component selector, the control name and the error key, to compute the translationKey
              // Ex: componentSelector= 'o3r-forms-poc-pres', controlName='firstName', error key {required: true} -> the error key is 'required'
              // translationKey = 'o3r-forms-poc-pres.firstName.required' or something like 'o3r-forms-poc-pres.firstName:required'
              const translationKey = `${this.componentSelector}.${controlFlatErrors.controlName}.${error.errorKey}`;
              return {
                translationKey,
                // Check if we have a long translation key in the defined translations associated to the presenter
                longTranslationKey: this.translations[`${translationKey}.long`] || undefined,
                validationError: error.validationError,
                translationParams: this.getTranslationParamsFromFlatErrors(controlFlatErrors.controlName || '', error) // ---> get the translation parameters for each control
              };
            })
          )
        }
      };
    }, {});

    return errors;
  }

  /**
   * Create the translation parameters for each form control error
   * @Note This is specific to the implementation of the form in each presenter
   */
  getTranslationParamsFromFlatErrors(controlName: string, error: FlatError) {
    switch (controlName) {
      case 'dateOfBirth': {
        switch (error.errorKey) {
          case 'max':
            return {max: error.errorValue.max};
          case 'min':
            return {min: error.errorValue.min};
          default:
            return {};
        }
      }
      case 'firstName': {
        switch (error.errorKey) {
          case 'maxlength':
            return {requiredLength: error.errorValue.requiredLength};
          default:
            return {};
        }
      }
      case 'dateOfBirth.month': {
        // Use case for form subcontrols
        switch (error.errorKey) {
          case 'max':
            return {maxMonthValue: error.errorValue.max};
          case 'min':
            return {minMonthValue: error.errorValue.min};
          default:
            return {};
        }
      }
      default:
        return {};
    }
  }
}
```

This is only an example of implementation. The _translationKey_ and _translationParams_ can be different implemented depending on the use cases.
<a name="inlineerror"></a>

### Display inline error messages

<a name="inlinebasicerror"></a>

#### Basic errors

```html
///----> presenter template
<input type="date" formControlName="dateOfBirth" [id]="id + 'dateOfBirth'"></input>
<mat-error *ngIf="travelerForm.controls.dateOfBirth.errors?.max">
  // use the translation object for the translationKey and get the translationParams from the error object returned by 'date-inline-input'.
  {{translations.maxMonthInDate | o3rTranslate: {max: travelerForm.controls.dateOfBirth.errors?.max.max} }}
</mat-error>
```

<a name="inlinecustomerror"></a>

#### Custom errors

```html
///----> presenter template
<input type="date" formControlName="dateOfBirth" [id]="id + 'dateOfBirth'"></input>
<mat-error *ngFor="let customError of travelerForm.controls.dateOfBirth.errors?.customErrors">
  // translation key and params are already accessible in the error object returned by the custom validator
  {{customError.translationKey | o3rTranslate: customError.translationParams }}
</mat-error>
```

<a name="adderrortostore"></a>

### Add errors to the store

As we already defined the error message object, as the return of __validate__ method in the presenter, we can get the error messages and add them to the store, in the container. Check the example below.

```typescript
/// ---> in the container
...
/** The form object model */
traveler: Traveler;

/** The form control object bind to the presenter */
mainFormControl: FormControl;

// Inject the store of form error messages
constructor(config: FormsPocContConfig, private store: Store<FormErrorMessagesStore>) {
...
this.traveler = {firstName: '', lastName: 'TestUser', dateOfBirth: new utils.Date()};
this.mainFormControl = new FormControl(this.traveler);
}

/** submit function */
submitAction() {
  // ...
  const isValid = !this.mainFormControl.errors;
  if (!this.mainFormControl.errors) {
    // ---> Submit logic here
    // eslint-disable-next-line no-console
    console.log('CONTAINER: form status and errors', this.mainFormControl.status, this.mainFormControl.errors);
    // eslint-disable-next-line no-console
    console.log('CONTAINER: submit logic here', this.mainFormControl.value);
  } else {
    const errors: FormError = {
      formId: `${this.id}-my-form-example`,
      errors: Object.keys(this.mainFormControl.errors).map((controlName: string) => {
        const controlErrors = this.mainFormControl.errors![controlName];
        return {htmlElementId: controlErrors.htmlElementId, errorMessages: controlErrors.errorMessages};
      })
    };
    // Add the errors corresponding to travelerForm in the store
    this.store.dispatch(new UpsertFormErrorMessagesEntities({entities: [errors]}));
  }
  // Emit an event when the submit logic is done
  this.onSubmitted.emit(isValid);
}
```

In the example above we save the errors in the store when we execute the submit action. It can be done at valueChanges or statusChanges.
<a name="errorstranslation"></a>

### Errors translation definition

For the localization of the error messages we keep the same way we have today ([LOCALIZATION](../localization/LOCALIZATION.md)), but we have specific places where to define the default translations of error messages.
<a name="translationcustomerror"></a>

#### Custom errors

Because the form validation depends on business logic and the custom validators are created in the container (see: [Form Validation](./FORM_VALIDATION.md)) we have to provide an error message for each validator and to ensure that the message is translatable.
We have to add the default translation keys, corresponding to the custom validators __in the container__ (_container.localization.json_ file).

```typescript
  // ---> in container class
  /**
   * Localization of the component
   */
  @Input()
  @Localization('./forms-poc-cont.localization.json')  // Here we will define the error messages translation keys
  public translations: FormsPocContTranslation;
```

Default values for the custom errors

```json
// ----> forms-poc-cont.localization.json
...
"travelerForm.dateOfBirth.max": { // ---> travelerForm is the name we have chosen for the form
  "description": "Validator for date of birth month",
  "defaultValue": "Max value for the month should be {{ max }}"
},
"travelerForm.global": {  // ---> validator for the root (global) form
  "description": "This validator will check if the first name or last name will be 'TEST'",
  "defaultValue": "First name and Last name cannot be {{forbiddenName}}"
}
...
```

<a name="translationbasicerror"></a>

#### Primitive errors

These validators are defined and applied at presenter level, so we have to define the translation of the error messages here.
Each possible validator should have a corresponding error message in __presenter.localization.json__ file.

```typescript
// ---> in presenter class
/**
 * Localization of the component
 */
@Input()
@Localization('./forms-pres-cont.localization.json')  // Here we will define the error messages translation keys
public translations: FormsPocPresTranslation;
```

Default values for the custom errors

```json
// The first key is not related to forms
"o3r-forms-poc-pres.key.not.related.to.forms": {
  "description": "Test Value with a translation",
  "defaultValue": "This is a test value translated from the presenter"
},
...
"o3r-forms-poc-pres.firstName.required": {
  "description": "Required validator for the first name",
  "defaultValue": "The first name is required"
},
"o3r-forms-poc-pres.firstName.maxlength": {
  "description": "Maxlength validator for the first name",
  "defaultValue": "The first name should have a max length of {{max}} characthers"
},
...
```
