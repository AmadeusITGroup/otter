# Forms overview

## Container/presenter and form creation
Container/presenter architecture was put in place to ensure the best re-usability/sharing 
### Where the form object creation should be done?
  * __form created in presenter__ - it's the presenter which decides how the data is displayed
  * __container__ needs only the value and errors propagated from the presenter
  * __container__ can set the default value

### How the container and presenter will communicate in forms context  
  * __presenter__ implements [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) and [Validator](https://angular.io/api/forms/Validator) (or [AsyncValidator](https://angular.io/api/forms/AsyncValidator)) interfaces
     * __propagate__ the value, the form status and the errors
  * __container__ apply [FormControlDirective](https://angular.io/api/forms/FormControlDirective) on the presenter html tag
     * __container__ set the default value using __formControl__ directive
     * __listen__ to the value and status changes using the same directive  

See [FORM_STRUCTURE](./FORM_STRUCTURE.md)

## You want to include form validation and display the errors
  * interfaces for the error messages provided in __@o3r/forms__
### Display inline errors     
  * the error messages returned by validators are used in the inline error display  
  * __simple/basic/primitive__ validators - set as a configuration of the __presenter__
    * localization of the error messages associated done on the presenter
    * the error object associated is computed here and has to be compliant with the store object model
    * _getFlatControlErrors_ function is available in __@o3r/forms__ to help with the creation of error object model  
  * __custom__ validators created at container level     
    * localization of the error messages associated done at container level
    * custom validators are passed as an input to the presenter
    * the error returned by the validator has to be compliant with the form error store model
### Display errors on a messages panel
  * a dedicated _FormErrorStore_ is available on __@o3r/forms__
     * allow the display of errors anywhere on the page
     * the error object model contains the translation key and params  
See [FORM_VALIDATION](./FORM_VALIDATION.md) and [FORM_ERRORS](./FORM_ERRORS.md)

## Form submit

### You want to submit the form
  * submit triggered by the submit button __in the presenter__ and an event is emitted
  * __container__ capture the event and execute the submit form logic

### What happens when you have multiple forms and you want to submit?
The answer for this question is that we should avoid having multiple _form_ tags in the same page, as much as possible, because it adds a lot of complexity. We should try to have only one _form_ tag that encapsulates everything and one submit action.
  
If the case of multiple forms it's really needed, then we found the following solution:
   * submit button hidden on the presenters
   * the __submit__ is __triggered from the page__ 
   * an __observable__ to trigger the submit is passed as __input__ to the containers;
   * _AsyncInput_ decorator is provided in __@o3r/forms__ to be applied on the observable input to ensure performance
   * submit form logic is executed on the containers
   * containers emit events when the submit is done
   * the page (parent) capture the events and continue its logic

This can be applied also, with only one form on the page, when you don't want a submit button in the presenter.

### What happens when you submit from page and the form was not touched
At the first display of the form, the inline errors (if the form is invalid) are not displayed, because the form element is __not touched__ and __dirty__   
In the case you want to show the inline errors after the submit, you have to:
   * register a function in the container to _mark touched and dirty_ the form 
   * the function is passed via an _@Output_ from the presenter and has to be called before executing the submit logic
   * _markAllControlsDirtyAndTouched_ helper is available in __@o3r/forms__ to mark interactions on given form

See [FORM_SUBMIT&INTERCOMMUNICATION](./FORM_SUBMIT_AND_INTERCOMMUNICATION.md)
