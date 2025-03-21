# Forms Submit and Intercommunication

## Parent component and input component communication

Since the __input component__ implements [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor), it will __propagate__ all the __value/status changes__ done inside the __form object__ to the parent component.
In this way, it will behave as an __input HTML element__ on which we can __bind__ a [FormControl](https://angular.io/api/forms/FormControl#description).
Also, the input component implements the [Validator](https://angular.io/api/forms/Validator) interface if your form validators are only synchronous or the [AsyncValidator](https://angular.io/api/forms/AsyncValidator) interface if the form needs asynchronous validators.
See [Form Validation](./FORM_VALIDATION.md) for more details about validation in Otter.
Implementing this interface gives us the possibility to define, in the `validate` function, the error object model which will be __propagated__ to the parent component. See [Form Errors](./FORM_ERRORS.md) for details.

The parent component will apply the [Form Control Directive](https://angular.io/api/forms/FormControlDirective) to the input component HTML tag in order to:
   * __Set the default value__ for the input component form object.
   * __Listen to the value changes__.
   * __Listen to the status changes__.
   * Easily __get the errors propagated__ by the input component.

See the [Otter form structure documentation](./FORM_STRUCTURE.md) for more details.

## Form submit

For the forms submit actions, we have to support two cases:
* Submit __from the component__: The submit button is displayed in the input component.
* Submit __from the page__ (application level): The button is hidden in the input component and the submit action is triggered at application level.

The display of the submit button should be configurable in the input component. A property has to be provided in the configuration.
```typescript
export interface FormsExamplePresConfig extends Configuration {
  /** Configuration to show/hide the submit button */
  showSubmitButton: boolean;
  ...
}
```
In both cases, the submit logic is handled in the parent component.
When submit is triggered either by the input component or the page, it is only notifying the parent component that a submit action was fired. The event is captured in the parent, and it is calling the execution of submit logic.
The parent component will handle the business logic and when it has finished, it will emit an event (`submitted`) with a boolean value (`true` if the submit is considered successful, `false` otherwise) which can be intercepted at page level.

### Submit from page
In this case, the submit button is hidden in the input component so the submit will be triggered from the page.
We propose a way of notifying the parent component that a submission has been triggered from the page.

__Passing an observable as an input to the parent component__
* In the page component template, the `submitTrigger$` observable is passed as input to the parent component.
```html
<o3r-forms-example-cont
  [config]="{presFormsExampleConfig: {showSubmitButton: false}}"
  [submitTrigger$]="submitTheForm$.asObservable()">
</o3r-forms-example-cont>
<button type="button" (click)="goNext()" id="next-btn">Continue</button>
```

* In the page component, we emit a new event each time we click on the `Next` button (which triggers a submit on the form).
```typescript
public submitTheForm$: Subject<boolean> = new Subject();

public goNext() {
  this.submitTheForm$.next(true);
}
```

* In the parent component, we receive the observable as an input, and we execute the submit logic each time the observable emits.
Note that we have put in place an [@AsyncInput](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/annotations/async-input.ts) decorator in __@o3r/forms__ to make sure that we will not have unhandled subscriptions if the reference of the input observable changes.
```typescript
import { AsyncInput } from '@o3r/forms';
...

export class FormsExampleContComponent implements OnInit, ... {

  /** Observable used to notify the component that a submit has been fired from the page */
  @Input()
  @AsyncInput()
  public submitTrigger$: Observable<boolean>;

  ...

  public ngOnInit() {
    ...
    if (this.submitTrigger$) {
      this.subscriptions.push(
        this.submitTrigger$.subscribe((_value) =>  this.submitAction())
      );
    }
  }

  public submitAction() {
    // this contains the logic executed at submit
  }
}
```

### Submit from input component
An event will be emitted when the submit of the form is fired (click on submit button, ENTER key, etc.), notifying the parent component about this. No logic is done at input component level.
As in the page submit, the submit logic will be handled inside the parent component.
In the following example, we are using the same function to execute the logic as in the page submit.

* Parent component:
```typescript
/** Observable used to notify the component that a submit has been fired from the page */
@Input()
@AsyncInput()
public submitTrigger$: Observable<boolean>;

...

/** Submit event received from the input component */
public doSubmit() {
  // Check that there is no submit from the page
  // In this case we do not want to execute the submit logic, as it will be done when we submit from the page
  if (!this.submitTrigger$) {
    this.submitAction();
  }
}

/** submit function */
public submitAction() {
  if (!this.exampleFormControl.errors) {
    // put your submit logic here
  } else {
    // put your error logic here
  }
}
```

### Handle inline errors at submit, before interacting with the form
When the form is first displayed, no inline errors are shown. If there is no interaction with the form and the submit is triggered, all invalid fields should display inline errors.
To avoid this, we have to mark the controls as touched and dirty before doing the submission. We also do this if the submit button is in the input component.

We need to __register a function__ to be called __to mark the controls__ from the input component as __dirty and touched__. So we emit an event with the callback function at the initialization
of the input component after we have created the form object. This function will be called in the parent component before executing the submit logic.

When the submit from the page is done, we execute the `submitAction` function in the parent component, and we have no access to the controls in the input component.

* __Input component__:
```typescript
/** Register a function to be called to mark the controls as touched and dirty */
@Output() registerInteraction: EventEmitter<() => void> = new EventEmitter<() => void>();

ngOnInit() {
  ...
  this.registerInteraction.emit(() => {
    markAllControlsDirtyAndTouched(this.form);
    this.changeDetector.markForCheck();
  });
}
```
We have provided a helper called [markAllControlsDirtyAndTouched](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/helpers.ts) in __@o3r/forms__ to mark the interaction with the form.

* __Parent component template__:
```html
<o3r-forms-example-pres (registerInteraction)="registerInteraction($event)"></o3r-forms-example-pres>
```

* __Parent component__:
```typescript
/** Observable used to notify the component that a submit has been fired from the page */
@Input()
@AsyncInput()
public submitTrigger$: Observable<boolean>;

/** This will store the function to make the child form as dirty and touched */
public _markInteraction: () => void;

/** Register the function to be called to mark the input component as touched and dirty */
public registerInteraction(fn: () => void) {
  this._markInteraction = fn;
}

/** submit function */
public submitAction() {
  // When submitting from page, call the function to mark the form in the input component as dirty and touched
  // It is not necessary to be called each time we submit. It is important to be called if the form is pristine
  if (this.submitTrigger$) {
    this._markInteraction();
  }
  // rest of the logic executed at submit
}
```

### What happens when you have multiple forms and want to submit?
We should avoid as much as possible having multiple _form_ tags in the same page because it adds a lot of complexity.
It would be better (if possible) to have only one _form_ tag that encapsulates everything and one submit action.

If multiple forms are really necessary, we found the following solution:
* The submit button is hidden in the input components.
* The __submit__ is __triggered from the page__.
* An __observable__ to trigger the submit is passed as __input__ to the parent components.
* The `AsyncInput` decorator is provided by __@o3r/forms__ to be applied on the observable input to ensure performance.
* Submit form logic is executed on the parent components.
* Parent components emit events when the submit is done.
* The page captures the events and continues its logic.

This can also be applied with a single form on the page, when you don't want a submit button in the input component.
