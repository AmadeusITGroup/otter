<h1 align="center">Otter forms</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/forms)](https://www.npmjs.com/package/@o3r/forms)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/forms?color=green)](https://www.npmjs.com/package/@o3r/forms)

This module provides utilities to enhance angular form (asynchronous decorator, additional validator, error store...).

## How to install

```shell
ng add @o3r/forms
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Container/presenter and form creation

A Container/presenter architecture was put in place to ensure best reusability/sharing

### Where the form object creation should be done?

* **form created in presenter** - it's the presenter that decides how the data is displayed
* **container** only values and errors are propagated from the presenter
* **container** can set the default value

### How the container and presenter will communicate in forms context

* **presenter** implements [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) and [Validator](https://angular.io/api/forms/Validator) (or [AsyncValidator](https://angular.io/api/forms/AsyncValidator)) interfaces
  * **propagate** the value, the form status and the errors
* **container** applies [FormControlDirective](https://angular.io/api/forms/FormControlDirective) on the presenter html tag
  * **container** sets the default value using **formControl** directive
  * **listen** to the value and status changes using the same directive

See [FORM_STRUCTURE](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms/FORM_STRUCTURE.md)

## You want to include form validation and display the errors

* interfaces for the error messages provided in **@o3r/forms**

### Display inline errors

* the error messages returned by validators are used in the inline error display
* **simple/basic/primitive** validators - set as a configuration of the **presenter**
  * localization of the associated error messages from the presenter
  * the error object associated is computed here and has to be compliant with the store object model
  * _getFlatControlErrors_ function is available in **@o3r/forms** to help with the creation of the associated error object
* **custom** validators created at container level
  * localization of the associated error messages from the container
  * custom validators are passed as an input to the presenter
  * the error returned by the validator has to be compliant with the form error store model

### Display errors on a messages panel

* a dedicated _FormErrorStore_ is available on **@o3r/forms**
  * allows the display of errors anywhere on the page
  * the error object model contains the translation key and params
See [FORM_VALIDATION](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms/FORM_VALIDATION.md) and [FORM_ERRORS](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms/FORM_ERRORS.md)

## Form submit

### You want to submit the form

* The submit is triggered by the submit button **in the presenter** and an event is emitted
* **container** captures the event and executes the submit form logic

### What happens when you have multiple forms and you want to submit?

The answer is that we should avoid as much as possible having multiple form tags in the same page as it adds a lot of complexity. We should try to have only one _form_ tag that encapsulates everything and one submit action.

If multiple forms are really needed, then we found the following solution:

* the submit button is hidden on the presenters
* the **submit** is **triggered from the page**
* an **observable** to trigger the submit is passed as **input** to the containers;
* _AsyncInput_ decorator is provided in **@o3r/forms** to be applied on the observable input to ensure performance
* the submit form logic is executed on the containers
* containers emit events when the submit is done
* the page (parent) captures the events and continues its logic

This can be applied also, with only one form on the page, when you don't want a submit button in the presenter.

### What happens when the submit is triggered by the page with pristine forms

At the first display of the form, the inline errors (if the form is invalid) are not displayed because the form element is **not touched** and **dirty**
In case you want to show the inline errors after the submit, you have to:

* register a function in the container to _mark touched and dirty_ the form
* pass the function via an _@Output_ from the presenter and call it before executing the submit logic
* use _markAllControlsDirtyAndTouched_ helper is available in **@o3r/forms** to mark interactions on given form

See [FORM_SUBMIT&INTERCOMMUNICATION](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms/FORM_SUBMIT_AND_INTERCOMMUNICATION.md)

## Details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms).
