[Form validators](#form-validators)

- [Form validators](#form-validators)
  - [Sync validators](#sync-validators)
    - [Container/presenter context](#containerpresenter-context)
      - [Basic validators](#basic-validators)
        - [Validators definition](#validators-definition)
        - [Apply validators](#apply-validators)
        - [Validators translations](#validators-translations)
      - [Custom Validators](#custom-validators)
        - [Validators definition](#validators-definition-1)
        - [Apply validators](#apply-validators-1)
        - [Validators translations](#validators-translations-1)
        - [Custom validation contracts available in @o3r/forms](#custom-validation-contracts-available-in-o3rforms)
  - [Async Validators](#async-validators)

<a name="form-validators"></a>

# Form validators

The validations on the form are improving overall data quality by validating user input for accuracy and completeness.
We are using the base concepts from Angular for the [form validation](https://angular.io/guide/form-validation), having default validators ( required, maxLength ...) but also custom validators (see Custom Validators in [form validation angular](https://angular.io/guide/form-validation)).

<a name="sync-validators"></a>

## Sync validators

<a name="container-presenter"></a>

### Container/presenter context

In container/presenter context we have to decide where to create and how to apply the validators.
Having this situation we decided to split the validation in 2 parts:

- __custom validators__ - the ones related to the business logic or applied to multiple form controls. As they are related to the business logic they have to be declared at container level.
- __primitive validators__ - simple configurable validators which will be declared at presenter level

The presenter will implement [Validator](https://angular.io/api/forms/NG_VALIDATORS) interface, meaning that we will have to implement __the validate__ method which help us in defining the error object structure.
(See [Form errors](./FORM_ERRORS.md) create error object section)
Each time the validate method is called the returned object is propagated to the parent (container in our case). If the object returned is _null_ the form status _VALID_. If the return is an object the form status is _INVALID_.

<a name="basic-validators"></a>

#### Basic validators

We are keeping the concept of validators from Angular forms. Please see [FormValidation](https://angular.io/guide/form-validation) and [Validators](https://angular.io/api/forms/Validators) in Angular for more details.

In Otter context we call the __basic or primitive__, the validators which are using primitive values (string, number, booleans) as inputs for the validation function.

These validators are defined and applied at presenter level. They can be set at form creation or later, depending on the use cases.
Validators values are given as a configuration on the presenter. This gave us the possibility to use the presenter with different set of validators.

<a name="validators-definition"></a>

##### Validators definition

```typescript
export interface FormsPocPresConfig extends Configuration {
  ...
  /** If true requires the control have a non-empty value */
  firstNameRequired: boolean;

  /** Requires the length of the control's value to be less than or equal to the provided number. */
  firstNameMaxLength?: number;
  ...

export const FORMS_POC_PRES_DEFAULT_CONFIG: FormsPocPresConfig = {
  ...,
  firstNameRequired: true,
  firstNameMaxLength: 5,
  ...
};
```

<a name="apply-validators"></a>

##### Apply validators

The validation can be applied on the html template, it can be given at form creation or set later in the presenter. This depends on the use cases.

- __on presenter html__
In the use case where we need to display inline errors, we have to apply directives corresponding to the validators on the html template (when it is possible), because Angular material needs the directives for the display of inline errors

```html
  <!-- Configurable 'required' validator applied directly on the template.  -->
  <input matInput formControlName="firstName" [required]="config.firstNameRequired" [id]="id + 'firstName'">
```

- __on presenter class__

```typescript
  this.config$.pipe(takeUntilDestroyed()).subscribe((config) => {
    const firstNameValidators = [];
    if (config.firstNameMaxLength) {
      // Apply validator based on config
      firstNameValidators.push(Validators.maxLength(this.config.firstNameMaxLength));
    }
    // firstNameValidators.push(otherValidators)
    if (firstNameValidators.length) {
      this.travelerForm.controls.firstName.clearValidators();
      this.travelerForm.controls.firstName.setValidators(firstNameValidators)
    }
  });
```

<a name="translation-validators"></a>

##### Validators translations

For each defined validator we need a corresponding translation key for the error message. These keys have to be defined in the corresponding __localization.json__ file of the __presenter__. In this way the presenter is aware about its own validations/error messages.
See [FORM_ERRORS](./FORM_ERRORS.md)  _Errors translation_ section  for more details.

<a name="custom-validators"></a>

#### Custom Validators

Since the built-in validators won't always match the exact use case of your application, sometimes you'll want to create a custom validator. See [Custom Validators](https://angular.io/guide/form-validation#custom-validators) in angular.
Our custom validators are usually related to the business logic or, they are applied to multiple fields/form controls.
As they are related to the business logic we will create them in the __container__ and pass them to the presenter via an input. The presenter is the one which applies them on the form.

<a name="custom-validators-definition"></a>

##### Validators definition

The validation function can be defined anywhere, but it has to be added to the validators object in the container.

- Validation function

```typescript
/** Validator which checks that the firstname or lastname are not equal with the parameter 'valueToTest' */
export function formsPocValidatorGlobal(valueToTest: string, translationKey: string, longTranslationKey?: string, translationParams?: any): CustomValidationFn {
  return (control: AbstractControl): CustomErrors | null => {
    const value: Traveler = control.value;
    if (!value || !value.firstName) {
      return null;
    }
    if (value.firstName !== valueToTest && value.lastName !== valueToTest) {
      return null;
    } else {
      return {customErrors: [{translationKey, longTranslationKey, translationParams}]}; // ---> See more about the returned error model in ./FORM_ERRORS.md
    }
  };
}
```

The object returned by the custom validator will be of type __ErrorMessageObject__ compatible with the form error store. (See [Form Errors](./FORM_ERRORS.md))
The key _customErrors_ it is used to identify the custom errors in the errors returned by a form control;

- Container

```typescript
// ...
/** Form validators */
validators: CustomFormValidation<Traveler>;
// ...
ngOnInit() {
  this.validators = {  // ---> This object is passed as an input to the presenter
    // Validator applied to the root (global) form
    global: formsPocValidatorGlobal(this.config.forbiddenName, translations.globalForbiddenName, `${translations.globalForbiddenName}.long`, {name: 'Test'}),
    // Validator applied on the dateOfBirth field
    fields: {dateOfBirth: dateCustomValidator(translations.dateInThePast)  }
  };
  // ...
  getFormsPocPresContext(overrideContext: Partial<FormsPocPresContextInput>): TemplateContext<FormsPocPresConfig, FormsPocPresContextInput, FormsPocPresContextOutput> {
  return {
    //  ...
    inputs: {
      validators: this.validators // ---> the validators sent to be applied on the presenter;
    },
    //  ...
  };
}
```

[__CustomFormValidation__](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/custom-validation.ts) is containing two entries, one for global (root) form validation and one for the other fields.
_Fields_ entry is receiving the form contract as generic type.

```typescript
/** Custom validation for the form */
export interface CustomFormValidation<T> {
  /** Validation for each field */
  fields?: CustomFieldsValidation<T>;
  /** Global validation for the form */
  global?: CustomValidationFn;
}
```

<a name="custom-apply-validators"></a>

##### Apply validators

The validators are applied to the form on the __presenter__ class.

```typescript
  /** Custom validators applied on the form */
  @Input() customValidators?: CustomFormValidation<Traveler>; // ---> receives the Traveler contract
  private customValidators$ = new BehaviorSubject<Traveler | undefined>(undefined);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    ...
    combineLatest([this.config$, customValidators$]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(([config, customValidators]) => {
      const firstNameValidators = [];
      if (config.firstNameMaxLength) { // Primitive validator
        // Apply validator based on config
        firstNameValidators.push(Validators.maxLength(this.config.firstNameMaxLength));
      }
      // Apply custom validation
      if (customValidators && customValidators.fields && customValidators.fields.firstName) {
        firstNameValidators.push(customValidators.fields.firstName);
      }
      // firstNameValidators.push(otherValidators)
      if (firstNameValidators.length) {
        this.travelerForm.controls.firstName.clearValidators();
        this.travelerForm.controls.firstName.setValidators(firstNameValidators)
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.customValidators) {
      this.customValidators$.next(this.customValidators);
    }
  }
```

<a name="custom-translation-validators"></a>

##### Validators translations

For each custom validator we need a corresponding translation key for the error message.
As they are defined in the container, the keys have to be defined in the corresponding __localization.json__ file of the __container__.
In this way the container knows about its own validations/error messages. See [FORM_ERRORS](./FORM_ERRORS.md) _Errors translation_ section for more details.

<a name="custom-validators-context"></a>

##### Custom validation contracts available in @o3r/forms

We have put in place a set of interfaces which will help us to define the custom validators and to keep the same structure in the framework.

```typescript
/**
 * The return of a custom validation
 */
export interface CustomErrors {
  /** The custom errors coming from a validation fn */
  customErrors: ErrorMessageObject[];
}

/** Custom validation function */
export type CustomValidationFn = (control: AbstractControl) => CustomErrors | null;

/** Custom validation functions for each field of T model */
export type CustomFieldsValidation<T> = { [K in keyof T]?: CustomValidationFn };

/** Custom validation for the form */
export interface CustomFormValidation<T> {
  /** Validation for each field */
  fields?: CustomFieldsValidation<T>;
  /** Global validation for the form */
  global?: CustomValidationFn;
}
```

<a name="async-validators"></a>

## Async Validators

When you need an asynchronous validator for your form, you have to make sure that the presenter will implement [AsyncValidator](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) interface.
Here you will have also to implement __the validate__ method to define the error object structure. The error object has to be returned in a Promise or in an Observable which has to be completed.
The only difference from sync validators is the returned object of the __validate__ method.
Also, you have to provide the [NG_ASYNC_VALIDATORS](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) token for the presenter.

For more details about the implementation have a look at [Async Validation in angular](https://angular.io/guide/form-validation#async-validation).

The example below contains the two mandatory things to do when you need an async validator: provide _NG_ASYNC_VALIDATORS_ token and implement _validate_ method.

```typescript
@Component({
  selector: 'o3r-forms-poc-pres',
  styleUrls: ['./forms-poc-pres.style.scss'],
  templateUrl: './forms-poc-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormsPocPresComponent),
      multi: true
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => FormsPocPresComponent),
      multi: true
    }
  ]
})
export class FormsPocPresComponent implements OnInit, OnDestroy, Configurable<FormsPocPresConfig>, AsyncValidator, Translatable<FormsPocPresTranslation>, FormsPocPresContext, ControlValueAccessor {
// ...
  /**
   * Return the errors for the validators applied global to the form plus the errors for each field
   */
  // ---> The implementation of this method is specific to each use case, the important thing is that it has to return a promise or an observable
  public validate(_control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> {
    return this.travelerForm.statusChanges.pipe(
      filter((status) => status !== 'PENDING'),
      map((status) => {
        if (status === 'INVALID') {
          const allControls = Object.keys(this.travelerForm.controls);
          return allControls.reduce(
            (currentError, controlName) => {
              ...
            }, {});
        } else {
          return null;
        }
      }),
      first()
    );
  }
}
```

There is a known [issue with the async validators on angular](https://github.com/angular/angular/issues/20424). The initial state of a form with an async validation is blocked to _'PENDING'_. Once the form value changes the status of the form is updated properly.
