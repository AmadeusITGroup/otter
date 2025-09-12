# Forms overview

## Introduction to forms

Applications use forms to handle user input in data-entry tasks (such as logging in or creating a profile for example). 

Angular provides two approaches for writing forms: [template-driven forms](https://angular.io/guide/forms) and [model-driven or reactive forms](https://angular.io/guide/reactive-forms).
The utilities that we provide in the __@o3r/forms__ module are based on Angular's reactive forms, which _"provide a model-driven approach to handling form inputs whose values change over time"_.
This type of form is applicable in many use cases, but there are a couple of exceptions where additional utilities may be useful.

These use cases include:
* A container/presenter structure for components
* Handling form submission at page level
* Displaying the error message outside the form

To handle these, this module provides utilities to enhance the build of Angular reactive forms, including:
* An asynchronous decorator (`@AsyncInput`) to ensure subscriptions are handled if the references of the input observables change.
* Basic and custom validators to validate user input for accuracy and completeness.
* A dedicated NgRX store for form errors to have the possibility of displaying error messages outside the form component.
* Helper functions to handle the interactions with the forms.

## Form structure
When a parent/input component architecture is put in place, we provide documentation on some best practices (such as form creation) to use when building Angular reactive forms components.

See [Form Structure](./FORM_STRUCTURE.md).

## Form validation
The forms use validators to verify their accuracy and completeness when validating them. During validation, error messages might be returned by the validators, which can be displayed.
The interfaces for these error messages are provided in __@o3r/forms__.

Depending on the use cases, there are different types of validators to use: __primitive validators__ or __custom validators__.
You may also need an __asynchronous validator__ for your form if it needs validation for an asynchronous source. 

See [Form Validation](./FORM_VALIDATION.md).

## Form error display

If the form validation returns error objects, there is a possibility of displaying them as inline error messages in the form and also in error panels
(anywhere on the page such as at the top of the page, above the submit button, etc.).

This is possible since we have a dedicated NgRX store for the form errors, this way we can listen to the store state and display the errors anywhere
in the page. The store is provided in the __@o3r/forms__ package.

See [Form Errors](./FORM_ERRORS.md).

## Form submission

We support two cases for the forms submit actions:
* Submit __from the component__: The submit button is displayed in the input component.
* Submit __from the page__ (application level): The button is hidden in the input component and the submit action is triggered at application level.

In both cases, the submit logic is handled in the parent component, which is notified when a submit action is fired.
The execution of the submit logic begins when the event is captured in the parent component. 
The parent component will handle the business logic and when it has finished, it will emit an event which can be intercepted at page level.

See [Form Submit and Intercommunication](./FORM_SUBMIT_AND_INTERCOMMUNICATION.md).

> [!NOTE]
> We implemented an example of forms components in the showcase application, in which a parent component has two subcomponents each containing a form.
> The first subcomponent has a form for the user to fill out their personal information and the second subcomponent has a form for the user to fill out
> information about their emergency contact. In this example, the two subcomponents correspond to input components.
>
> You can find the implementation of this forms example [in the source code of the showcase application](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase/src/components/showcase/forms-parent).
>
> This example will be referenced throughout this documentation.
