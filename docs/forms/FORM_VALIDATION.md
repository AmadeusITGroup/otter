# Form validators

Form validations improve overall data quality by validating user input for accuracy and completeness.
We are using the core concepts from Angular for the [form validation](https://angular.io/guide/form-validation), with default validators (required, maxLength, etc.)
but also custom validators (see Custom Validators in [Angular form validation](https://angular.io/guide/form-validation)).

## Sync validators

### Context of parent component and input component

In the parent/input component context, we have to decide where to create and how to apply the validators.
In this situation, we decided to split the validation into two parts:

- __Custom validators__: The ones related to the business logic or applied to multiple form controls. As they are related to the business logic, they have to be declared at parent component level.
- __Primitive validators__: Simple and configurable validators which will be declared at input component level.

The input component will implement the [Validator](https://angular.io/api/forms/NG_VALIDATORS) interface, meaning that we will have to implement the `validate` function which will help us in defining the error object structure.
(See the create error object section in [Form Errors](./FORM_ERRORS.md)).
Each time the `validate` function is called, the returned object is propagated to the parent component. If the returned object is `null`, the form status is `VALID`. Otherwise, the form status is `INVALID`.

### Basic validators

We are keeping the concept of validators from Angular forms. Please see [FormValidation](https://angular.io/guide/form-validation) and [Validators](https://angular.io/api/forms/Validators) in Angular for more details.

We call validators __basic or primitive__ if they are using primitive values (string, number, boolean) as inputs for the validation function.

These validators are defined and applied at input component level. They can be set at form creation or later, depending on the use cases.
Validator values are given as a configuration in the input component. This gives us the possibility of using the input component with different sets of validators.

#### Define basic validators

Below is an example of validator values that are defined in the configuration of the input component:

```typescript
export interface FormsExamplePresConfig extends Configuration {
  ...
  /** Requires the length of the control's value to be less than or equal to the provided number. */
  firstNameMaxLength?: number;
}
```

#### Apply basic validators

The validation can be applied in the HTML template, it can be given at form creation, or it can be set later in the input component. This depends on the use cases.

* __Input component HTML__:
In the use case where we need to display inline errors, we have to apply directives corresponding to the validators in the HTML template (when it is possible),
because Angular material needs the directives for the display of inline errors.

```html
<!-- Configurable 'required' validator applied directly on the template. -->
<input matInput formControlName="firstName" [required]="config.nameRequired" [id]="'name'">
```

* __Input component class__: The validators are applied to the form in the __input component__ class. For example:

```typescript
public ngOnInit() {
  const nameValidators = [];
  if (this.config?.nameMaxLength) {
    // Apply validator based on config
    nameValidators.push(Validators.maxLength(this.config.nameMaxLength));
  }
  ...
  this.form.controls.name.setValidators(nameValidators);
}
```

#### Basic validators translations

For each defined validator, we need a corresponding translation key for the error message.
These keys have to be defined in the corresponding `localization.json` file of the __input component__.
This way the input component is aware about its own validations/error messages.

See the _Errors translation_ section in [Form Errors](./FORM_ERRORS.md) for more details.

### Custom Validators

Since the built-in validators won't always match the exact use case of your application, sometimes you'll want to create a custom validator.
(See [Custom Validators](https://angular.io/guide/form-validation#custom-validators) in Angular).

Our custom validators are usually related to the business logic, or they are applied to multiple fields/form controls.
Since they are related to the business logic, we will create them in the __parent component__ and pass them to the input component via an input. The input component is the one that applies them to the form.

#### Define custom validators

The validation function can be defined anywhere, but it has to be added to the validators object in the parent component.

* __Validation function__:

The object returned by the custom validator will be of type `ErrorMessageObject` compatible with the form error store. (See [Form Errors](./FORM_ERRORS.md)).
The key `customErrors` of this object is used to identify the custom errors in the errors returned by a form control.

You can find an [example](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/showcase/forms/forms-pres.validators.ts) of two custom validators in the forms example of the showcase application.

* __Parent component__: 

The validators object in the parent component is of type [__CustomFormValidation__](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/custom-validation.ts).
This interface contains two entries: one for global (root) form validation and one for the other fields.
The `fields` entry is receiving the form contract as generic type.

The implementation of the two custom validators in the validators object of the parent component can be found in the [forms component of the showcase application](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/showcase/forms/forms-pres.component.ts).

#### Apply custom validators

The validators are applied to the form in the __input component__ class. For example:

```typescript
/** Custom validators applied on the form */
@Input() customValidators?: CustomFormValidation<PersonalInfo>; // ---> receives the PersonalInfo contract

public ngOnInit() {
  /** Get custom validators and apply them on the form */
  const nameValidators = [];
  if (this.customValidators && this.customValidators.fields && this.customValidators.fields.name) {
    nameValidators.push(this.customValidators.fields.name);
  }
  ...
  this.form.controls.name.setValidators(nameValidators);
  this.form.updateValueAndValidity();
  ...
}
```

#### Custom validators translations

For each custom validator, we need a corresponding translation key for the error message.
Since they are defined in the parent component, the keys have to be defined in the corresponding `localization.json` file of the __parent component__.
This way the parent component knows about its own validations/error messages. 
See the _Errors translation_ section in [Form Errors](./FORM_ERRORS.md) for more details.

#### Custom validation contracts

We have put in place a set of interfaces that will help us to define the custom validators and to keep the same structure in the framework.
You can find them in the [@o3r/forms package](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/custom-validation.ts).

## Async Validators

When you need an asynchronous validator for your form, you have to make sure that the input component will implement the [AsyncValidator](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) interface.
Here you will also have to implement the `validate` function to define the error object structure. The error object has to be returned in a Promise or in an Observable that must be completed.
The only difference from sync validators is the object returned by the `validate` function.
Also, you have to provide the [NG_ASYNC_VALIDATORS](https://angular.io/api/forms/NG_ASYNC_VALIDATORS) token for the input component.

For more details about the implementation, have a look at [Async Validation in Angular](https://angular.io/guide/form-validation#async-validation).

The example below contains the two mandatory tasks to do when you need an async validator: provide the `NG_ASYNC_VALIDATORS` token and implement the `validate` function.

```typescript
@Component({
  selector: 'o3r-forms-example-pres',
  styleUrls: ['./forms-example-pres.style.scss'],
  templateUrl: './forms-example-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormsExamplePresComponent),
      multi: true
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => FormsExamplePresComponent),
      multi: true
    }
  ]
})
export class FormsExamplePresComponent implements OnInit, AsyncValidator, ControlValueAccessor, ... {
  // ...
  /** Return the errors for the validators applied global to the form plus the errors for each field */
  // ---> The implementation of this method is specific to each use case, the important thing is that it has to return a promise or an observable
  public validate(_control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> {
    return this.exampleFormControl.statusChanges.pipe(
      filter((status) => status !== 'PENDING'),
      map((status) => {
        if (status === 'INVALID') {
          const allControls = Object.keys(this.form.controls);
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
