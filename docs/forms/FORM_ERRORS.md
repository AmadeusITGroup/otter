# Form errors

### Form error store

To have the possibility of displaying inline error messages in the form and also in error panels (on the top of the page, above the submit button, etc.),
we recommend a dedicated NgRX store for the form errors. This way we can listen to the store state and display the errors anywhere in the page.
The store is provided in the __@o3r/forms__ package. See [Form Error Store](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/stores/form-error-messages/form-error-messages.state.ts)
for more details and to view the state object model.

#### Error object model

The store model object extends the `FormError` interface.

- The `FormError` interface contains an identifier for each component that has a form inside, plus the errors (of type `ElementError`) associated to that form.

- The `ElementError` interface contains all the errors associated to the HTML element.
It has an `htmlElementId` property, which is an identifier that can be used as an anchor link to focus on the HTML element where the validation failed.
It also contains the element's error message objects of type `ErrorMessageObject`.

- The `ErrorMessageObject` interface is associated to an error message on a field. It contains several properties to display the error message, including translation
keys to display the short or long version of the message, translation parameters of the error message, the original error object, etc.

You can find these interfaces in the [@o3r/forms package](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/core/errors.ts).

### Creating an error object

The input component has to implement the [Validator](https://angular.io/api/forms/NG_VALIDATORS) or the [AsyncValidator](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) interface
in order to give us the possibility of defining the error object that will be returned by the form.

The error message structure will be defined in the implementation of the `validate` function.

As the `validate` function should return a [ValidationErrors](https://angular.io/api/forms/ValidationErrors) object, which is a map of custom objects (of type `any`),
we can adapt the returned object to the store of error messages. This will ease the process of adding the errors in the store.

We have to make sure that we provide the `htmlElementId` of the errors in the store that match the __HTML fields__.
To identify a field, we can generate an `id` in the parent component instance, provide it through the input mechanism, and concatenate it with the `formControlName`.
Since we will have a __unique id__ by instance of the parent component, we are sure to have unique HTML identifiers for the form fields. You can find an example of this implementation
in the subcomponents, such as the [personal information component](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/utilities/forms-personal-info/forms-personal-info-pres.ts),
of the forms page in the showcase application.

The object returned by the `validate` function is the error object that is propagated to the parent component.

#### Categories of error messages

There are two types of validators (see [Form Validation](./FORM_VALIDATION.md)) and therefore two categories of error messages:

- __Custom error__ - defined in the parent component as it holds the business logic
- __Primitive error__ - computed in the input component

##### Custom errors

They are returned by __custom validators__ and have the type [CustomErrors](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/custom-validation.ts) (defined in __@o3r/forms__).
This type uses the `customErrors` key with an `ErrorMessageObject` array, which has to contain all the custom errors of a form control or a group.

The error object model returned by the validator has to be compliant with the store model.

```typescript
// Example of returned object by the custom validator
{
  customErrors: [{
    translationKey: 'o3r-error-message.confirmPassword.doesNotMatch',
    longTranslationKey: 'o3r-long-error-message.confirmPassword.doesNotMatch',
    translationParams: {
      passwordLength: 10,
      confirmPasswordLength: 5
    }
  }]
};
```

##### Basic/primitive errors

The error object structure has to be created in the input component because the __basic validators__ are defined at input component level (see [Form Validation](./FORM_VALIDATION.md)).

#### Build error messages

We put in place a generic helper [getFlatControlErrors](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/core/helpers.ts) in __@o3r/forms__. 
This function gets a flattened list of all the errors from the form and its descendants and concatenates the __custom errors__.
The object returned by the helper is of type [ControlFlatErrors](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/core/flat-errors.ts), defined in __@o3r/forms__.

You can find an example of the implementation of a `validate` [function](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/utilities/forms-personal-info/forms-personal-info-pres.ts)
in the forms example of the showcase application.

This is only an example of an implementation. The `translationKey` and `translationParams` can be implemented differently depending on the use cases.

### Display inline error messages

Below, you will find examples of HTML implementations to display basic and custom errors as inline error messages.
Both of these examples can be found in the forms example of the showcase application linked above.

#### Basic errors

```html
<!-- input component template -->
<o3r-date-picker-input-pres [id]="'dateOfBirth'" formControlName="dateOfBirth"></o3r-date-picker-input-pres>
@if (form.controls.dateOfBirth.errors?.max) {
  <div>
    <!-- use the translation object for the translationKey and get the translationParams from the error object returned by 'getTranslationParamsFromFlatErrors'. -->
    {{translations.max | o3rTranslate: {max: form.controls.dateOfBirth.errors?.max.max} }}
  </div>
}
```

#### Custom errors

```html
<!-- input component template -->
<o3r-date-picker-input-pres [id]="'dateOfBirth'" formControlName="dateOfBirth"></o3r-date-picker-input-pres>
@for (customError of form.controls.dateOfBirth.errors?.customErrors; track customError) {
  <div>
    <!-- translation key and params are already accessible in the error object returned by the custom validator -->
    {{customError.translationKey | o3rTranslate: customError.translationParams}}
  </div>
}
```

### Add errors to the store

As we have already defined the error message object as the return of the `validate` function in the input component, we can get the error messages in the parent component and add them to the store.
Check the example below:

```typescript
// ---> in the parent component
/** The form object model */
public exampleModel: ExampleModel;
/** The form control object bind to the input component */
public exampleFormControl: FormControl;

// Inject the store of form error messages
constructor(private store: Store<FormErrorMessagesStore>) {
  this.exampleModel = { prop1: '', prop2: '' };
  this.exampleFormControl = new FormControl(this.exampleModel);
}

/** submit function */
public submitAction() {
  if (this.exampleFormControl.errors) {
    const errors: FormError = {
      formId: `my-form-example`,
      errors: Object.keys(this.exampleFormControl.errors).map((controlName: string) => {
        const controlErrors = this.exampleFormControl.errors![controlName];
        return {htmlElementId: controlErrors.htmlElementId, errorMessages: controlErrors.errorMessages};
      })
    };
    // Add the errors corresponding to the form in the store
    this.store.dispatch(new UpsertFormErrorMessagesEntities({entities: [errors]}));
  }
}
```

In the example above, we save the errors in the store when we execute the submit action. This action can be called at `valueChanges` or `statusChanges` in the input component.

### Errors translation definition

For the localization of the error messages, we keep the same way of working as we have today (check out [LOCALIZATION](../localization/LOCALIZATION.md)).

#### Custom errors

Because the form validation depends on business logic and the custom validators are created in the parent component (see [Form Validation](./FORM_VALIDATION.md)),
we have to provide an error message for each validator and ensure that the message is translatable.
We have to add the default translation keys, corresponding to the custom validators, to the localization file __in the parent component__.

```typescript
// ---> in parent component class
/** Localization of the component */
@Input()
@Localization('./forms-example-cont-localization.json')  // Here we will define the translation keys of the error messages
public translations: FormsExampleContTranslation;
```

Default values have to be defined for the custom errors, for example:

```json5
// ----> forms-example-cont-localization.json
{
  "form.dateOfBirth.dateInThePast": {
    "description": "Validator for date of birth",
    "defaultValue": "Date of birth should be in the past"
  },
  "form.globalForbiddenName": {
    "description": "This validator will check if the name will be the given config",
    "defaultValue": "Name cannot be { name }"
  },
  // ...
}
```

#### Primitive errors

These validators are defined and applied at input component level, so we have to define the translation of the error messages here.
Each possible validator should have a corresponding error message in the input component's localization file.

```typescript
// ---> in input component class
/** Localization of the component */
@Input()
@Localization('./forms-example-pres-localization.json') // Here we will define the translation keys of the error messages
public translations: FormsExamplePresTranslation;
```

Default values have to be defined for the primitive errors, for example:

```json5
// ----> forms-example-pres-localization.json
{
  "o3r-forms-example-pres.name.required": {
    "description": "Required validator for the name",
    "defaultValue": "The name is required"
  },
  "o3r-forms-example-pres.name.maxLength": {
    "description": "Validator for the max length of the name",
    "defaultValue": "Max length of the name should be { maxLength }"
  },
  // ...
}
```
