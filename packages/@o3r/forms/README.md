<h1 align="center">Otter forms</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/forms?style=for-the-badge)](https://www.npmjs.com/package/@o3r/forms)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/forms?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/forms)

One of the approaches for writing forms that Angular provides is called [model-driven or reactive forms](https://angular.io/guide/reactive-forms),
which _"provide a model-driven approach to handling form inputs whose values change over time"_. This type of form is applicable in many use cases,
but there are a couple of exceptions where additional utilities may be useful.

These use cases include:
* A container/presenter structure for components
* Handling form submission at page level
* Displaying the error message outside the form

To handle these, this module provides utilities to enhance the build of Angular reactive forms, including:
* An asynchronous decorator (`@AsyncInput`) to ensure subscriptions are handled if the references of the input observables change.
* Basic and custom validators to validate user input for accuracy and completeness.
* A dedicated NgRX store for form errors to have the possibility of displaying error messages outside the form component.
* Helper functions to handle the interactions with the forms.

## How to install

```shell
ng add @o3r/forms
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Details

Find more information in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/forms).
