# Forms structure

This documentation will help you with some best practices to use when building Angular reactive forms components that have a parent/input component structure (such as [container/presenter](../components/CONTAINER_PRESENTER.md)).
Note that this structure is simply an implementation of the `ControlValueAccessor` pattern, but we have chosen to guide you with an [example implemented in the showcase application](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/app/forms).

## Parent/input component and reactive forms
A parent/input component architecture was put in place to ensure the best reusability and sharing of components.

### Form creation in the parent component or input component?

* The __form creation__ (it can be a [__FormGroup__](https://angular.io/api/forms/FormGroup) or [__FormArray__](https://angular.io/api/forms/FormArray)
  or [__FormControl__](https://angular.io/api/forms/FormControl)) should be done __in the input component__ because:
   * It is up to the input component to decide how the data will be displayed/computed. For example, a date can be displayed in an input field
    ([FormControl](https://angular.io/api/forms/FormControl)) in one input component or in a [FormGroup](https://angular.io/api/forms/FormGroup) containing
    3 input fields in another input component (the parent component only needs a date value).
   * We will not use the `formGroup` / `formArray` / `formControl` object as a two-way data binding object between the parent component and the input component.
* The __parent component__ only needs the value and, in some specific cases, the errors propagated from the input component. If needed, it can set the default value.

From now on we will refer to __input component form object__ as the `formGroup` or `formArray` or `formControl` created in the input component.

### Data exchange between parent component and input component

#### Simple cases
In a simple case, the purpose of the data exchange is to display the inline errors, check the form validity, and emit the form value.
* The input component containing the form should:
  * Handle the display of form errors.
  * Trigger the form submit.
  * Check the form validity.
  * Use an event emitter to propagate the form value to the parent component.
* The parent component should intercept the propagated value and execute the submit logic.

#### Complex cases
Data exchange in a complex case has the same purpose as the simple case, plus the display of a message panel containing the form errors and the ability to submit the form from the input component or page.
* The input component containing the form should:
   * Implement [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor). It will propagate all the __value/status changes__ done inside the __input component form object__ to the parent component.
     In this way, it will behave as an __input HTML element__ on which we can __apply__ the [ngModel](https://angular.io/api/forms/NgModel) directive, or we can bind a [FormControl](https://angular.io/api/forms/FormControl#description).
   * Implement the [Validator](https://angular.io/api/forms/Validator) interface if your form validators are only synchronous or the [AsyncValidator](https://angular.io/api/forms/AsyncValidator) interface if the form needs asynchronous validators.
     See [Form Validation](./FORM_VALIDATION.md) for more details about validation in Otter.
      * Implementing this interface gives us the possibility to define, in the `validate` function, the error object model which will be propagated to the parent component. See the [form error documentation](./FORM_ERRORS.md) for details.
* The parent component will apply a [Form Control Directive](https://angular.io/api/forms/FormControlDirective) to the input component form to give the possibility to:
   * Set the default value for the input component form object if needed.
   * Listen to the value changes if needed.
   * Listen to the status changes if needed.
   * Easily get the errors propagated by the input component.

We prefer to use the `formControl` rather than `ngModel` because we can easily listen to the `valueChanges` or `statusChanges` of the input component form.
Another constraint is that it's easier to identify the parent component context for the CMS (See [Component Structure](../components/COMPONENT_REPLACEMENT.md) for details about the component context).

## Component creation
Here, a __component__ refers to a parent component or an input component.

### Basic case
In this case, all we need to do is to implement a form, display the inline errors, check the form validity, and do something with the form value.

In the input component:
* The __form__ is __created__.
* The __validators__ are applied (see [Form Validation](./FORM_VALIDATION.md) for details about validators and where they are created).
* The __inline errors__ are handled (see [Form Errors](./FORM_ERRORS.md) for details about the error messages translations).
* The form validity will be checked.
* The submission is triggered and the form value is emitted.

The parent component:
* Captures the form value emitted.
* Executes the submit logic.

The difference from the default implementation of the [forms in Angular](https://angular.io/guide/reactive-forms) is that we have to emit the form value from the parent component to the input component,
using an [@Output](https://angular.io/api/core/Output) event.
Another difference might be related to the custom validators, which we suggest to be created in the parent component because they can be related to the business logic.
(Please have a look at the [dedicated section](./FORM_VALIDATION.md) on the forms validators.).

### Adding complexity
In addition to the simple case, if we need an __error message__ panel, which can be displayed anywhere in the page,
or to __submit the form outside the component__, we must follow the more complex implementation described below.

#### 1. Basic structure
The form created in the input component and the default value of the form control in the parent component should have the same contract. The contract of a form is an interface that defines
the names of the form controls and the type of value that should be handled by each control.

Below is an example of a component creation based on a form used to introduce data for a `PersonalInfo` object.

__Define the contract object:__

Below is an example of a model used to create a form that introduces data for a `PersonalInfo` object.
```typescript
/** Model used to create Personal Info form */
export interface PersonalInfo {
  /** Name */
  name: string;
  /** Date of birth */
  dateOfBirth: string;
}
```

__Parent component class:__
* Create a form control to set the binding and the default data.
* This form control will be passed as an input to the input component class through the HTML template.

You can find the implementation of a parent component class in the [showcase application](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/showcase/forms-parent/forms-parent.component.ts).

__Input component class:__
   * Here we have to create the `formGroup`/`formArray`/`formControl` object.
   * Provide [NG_VALUE_ACCESSOR](https://angular.io/api/forms/NG_VALUE_ACCESSOR) - used to provide a [ControlValueAccessor](https://angular.io/api/forms/DefaultValueAccessor) for form controls, to write a value and listen to changes on input elements.
   * Provide [NG_VALIDATORS](https://angular.io/api/forms/NG_VALIDATORS) - this is an [InjectionToken](https://angular.io/api/core/InjectionToken) for registering additional synchronous validators used with forms.

You can find the implementation of an input component class in the [showcase application](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/utilities/forms-personal-info/forms-personal-info-pres.component.ts).

__Submit and Intercommunication:__

We have to handle specific cases for form submission and communication between __input component/parent component/page__.
For the submit action, we have to support two cases:
* __Submit from page__ (app level) - there is no submit button in the input component and the submit action is triggered at application level.
  * The __page__ triggers the submit action. The __parent component__ receives the signal, executes the submit logic, and emits an event when the submit logic is finished.

    This is useful when you have multiple forms on a page and you want to trigger the submit for all in the same time.
* __Submit from input component__ - the submit button is displayed.
  * The submit button is clicked and the __input component__ emits an event. The __parent component__ receives the signal, executes the submit logic, and emits an event when the submit logic is finished.

This section is explained in details in the [Otter form submit and intercommunication documentation](./FORM_SUBMIT_AND_INTERCOMMUNICATION.md).

#### 2. Include validation
You can create basic or custom validators in your application, depending on the use cases.
You can find details on this in the [Otter form validation documentation](./FORM_VALIDATION.md).
