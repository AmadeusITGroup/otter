[Forms Submit and Intercommunication](#form-submit)
  1. [Container presenter context](#container-presenter)
  2. [Form submit](#form-submit)
      1. [Submit from page](#page-submit)
      2. [Submit from presenter](#presenter-submit)
  1. [Handle inline errors at submit](#handle-inline-error-submit)
      
<a name="form-submit"></a>
# Forms Submit and Intercommunication 

<a name="container-presenter"></a>
### Container presenter communication

Having the __presenter__ implementing [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor), it will __propagate__ all the __value/status changes__ done inside the __presenter form object__ to the parent, in our case the container.
In this way it will behave as an __HTML input element__ on which we can __bind__ a [FormControl](https://angular.io/api/forms/FormControl#description).   
Also, the presenter is implementing [Validator](https://angular.io/api/forms/Validator) interface, if your form validators are only synchronous or [AsyncValidator](https://angular.io/api/forms/AsyncValidator) interface if the form needs asynchronous validators. See [FORM_VALIDATION](./FORM_VALIDATION.md) for more details about validation in Otter.  
Implementing this interface gives us the possibility to define, in the __validate__ method, the error object model which will be __propagated__ to the parent/container. See [FORM_ERRORS](./FORM_ERRORS.md) for details.  

The container will apply the [Form Control Directive](https://angular.io/api/forms/FormControlDirective) to the presenter html tag in order to:
   * __set the default value__ for the presenter form object. 
   * __listen to the valueChanges__
   * __listen status changes__
   * easily __get the errors propagated__ by the presenter

See [FORM_STRUCTURE](./FORM_STRUCTURE.md) for more details.

<a name="form-submit"></a>
### Form submit

For the forms submit actions we have to support 2 cases:
* submit __from the component__ - the submit button is displayed in the presenter
* submit __from the page__ (app level) - the button is hidden in the presenter and the submit action is triggered at application level

The display of the submit button should be configurable in the presenter. A config property has to be provided in the presenter configuration.
```typescript
export interface FormsPocPresConfig extends Configuration {
  /** Configuration to show/hide the submit button */
  showSubmitButton: boolean;
  ...
}  
```    
In both cases the submit logic is handled in the container. 
When submit is triggered either by the presenter or the page, it is only notifying the container that a submit action was fired. The event is captured in the container and it is calling the execution of submit logic.  
The container will handle business logic at submit and when it has finished, it will emit an event (__submitted__) with a boolean value (true if the submit is considered successful, false otherwise) which can be intercepted at page level.   

<a name="page-submit"></a>
#### Submit from page
In this case the submit button should be hidden in the presenter, so the submit will be triggered from page/parent component.
We propose a way of notifying the container that a submission has been triggered from the page.

* __Passing an observable as an input to the container__
  * Page component template
  
The _submitTrigger$_ observable is passed as input to the container.  
  ```typescript
  <o3r-forms-poc-cont
    [config]="{presFormsPocConfig: {showSubmitButton: false}}"
    [submitTrigger$]="submitTheForm$.asObservable()"
    (submitted)="onFormSubmitted($event)">
  </o3r-forms-poc-cont>
  <button mat-raised-button color="accent" (click)="goNext()" id="next-btn">Continue</button>
  ```
  * In the page component we emit a new event each time we click on _Next_ button. We want that this, to trigger a submit on the form.
  ```typescript
  ...
  submitTheForm$: Subject<boolean> = new Subject();
  ...
  goNext() {
    this.submitTheForm$.next(true);
    ...
  }
  onFormSubmitted(value: boolean) {
    console.log('Form submitted result:', value);
    ...
  }
  ```
  * In the container we receive the observable as an input, and each time the observable emits we execute the submit logic.  
  Note that we have put in place an [@AsyncInput](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/forms/src/annotations/async-input.ts) decorator in __@o3r/forms__ to make sure that we will not have unhandled subscriptions if the reference of the input observable changes.
  ```typescript
  ...
  import { AsyncInput ...} from '@o3r/forms';   
  ...
    /** Observable used to notify the component that a submit has been fired from the page */
    @Input()
    @AsyncInput()
    public submitTrigger$: Observable<boolean>;
  
    /**
     * Emit an event when the submit has been fired from the component (block)
     */
    @Output() onSubmitForm: EventEmitter<void> = new EventEmitter<void>();
  
    /**
     * Emit an event at the end of the submit executed logic
     */
    @Output() onSubmitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  
    ...
    ngOnInit() {
      this.formsPocPresContext$.next(this.getFormsPocPresContext({}));
  
      if (this.submitTrigger$) {
        this.subscriptions.push(
          this.submitTrigger$.subscribe((_value) => {
            this.submitAction();
          })
        );
      }
    }
  
    submitAction() {
      // this contains the logic executed at submit
      ... 
      // Emit an event at the end of the submit logic execution
      const isValid = true; // means that the submit logic is successful
      this.onSubmitted.emit(isValid);
    }
  ```
  
<a name="presenter-submit"></a>  
#### Submit from presenter
An event will be emitted when the submit of the form is fired (click on submit button, ENTER key ...), notifying the container about this. No logic is done at presenter level.  
As in the page submit, the submit logic will be handled inside the container.  
In the following example we are using the same function to execute the logic as in the page submit.

* Container component
```typescript
  ...
  /** The form control object bind to the presenter */
  mainFormControl: FormControl;
  ...
  constructor(private store: Store<FormErrorMessagesStore>, public changeDetector: ChangeDetectorRef) {
    this.translations = translations;
    this.traveler = {firstName: '', lastName: 'TestUser', dateOfBirth: new utils.Date()};
    this.mainFormControl = new FormControl(this.traveler);
  }
  ...  
/** Submit event received from the presenter */
  onSubmit() {
    this.onSubmitForm.emit();
    // Check that there is no submit from the page/parent component
    if (!this.submitMe$) { // In this case we do not want to execute the submit logic, as it will be done when we submit from the page
      this.submitAction();
    }
  }

  /** submit function */
  submitAction() {
    // When submitting from page, call the function to mark the form in the presenter as dirty and touched
    if (this.submitTrigger$) { // ---> this will be explained below
      this._markInteraction();
    }
    const isValid = !this.mainFormControl.errors;
    if (!this.mainFormControl.errors) {
      // put your submit logic here
    } else {
      const errors: FormError = {
        formId: `${this.id}-my-form-example`,
        errors: Object.keys(this.mainFormControl.errors).map((controlName: string) => {
          const controlErrors = this.mainFormControl.errors![controlName];
          return {htmlElementId: controlErrors.htmlElementId, errorMessages: controlErrors.errorMessages};
        })
      };
      this.store.dispatch(new UpsertFormErrorMessagesEntities({entities: [errors]}));
    }
    this.onSubmitted.emit(isValid);
  }
```

<a name="handle-inline-error-submit"></a>
### Handle inline errors at submit, before interacting with the form
At the first display of the form there is no inline error shown. If there is no interaction with the form and submit is triggered, all invalid fields should display inline errors.
For this we have to mark the controls as touched and dirty before doing the submission.  
If the submit button is in the presenter, we mark the controls as dirty and touched before doing the submission.  

When the submit is done from the page we execute the submitAction in the container, and we have no access to the controls in the presenter.  
We need to __register a function__ to be called __to mark the controls__ from the presenter as __dirty and touched__. So we emit an event with the callback function at the initialization of the presenter component after we have the form object (travelerForm here) created. This function will be called in the container before executing the submit logic. 
* Presenter component
```typescript
  ...
  /** Register a function to be called to mark the controls as touched and dirty */
  @Output() registerInteraction: EventEmitter<() => void> = new EventEmitter<() => void>();
  ...
  ngOnInit() {
    ...
    this.registerInteraction.emit(() => {
      markAllDirtyAndTouched(this.travelerForm);
      this.changeDetector.markForCheck();
    });
  }
```
We have provided a helper called [markAllControlsDirtyAndTouched](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/forms/src/core/helpers.ts) in __@o3r/forms__ to mark the interaction with the form.

* Container component
```typescript
  ...
  /** The form control object bind to the presenter */
  mainFormControl: FormControl;
  
  /** This will store the function to make the child form as dirty and touched */
  _markInteraction: () => void;
  ...
  constructor(private store: Store<FormErrorMessagesStore>, public changeDetector: ChangeDetectorRef) {
    this.translations = translations;
    this.traveler = {firstName: '', lastName: 'TestUser', dateOfBirth: new utils.Date()};
    this.mainFormControl = new FormControl(this.traveler);
  }
  ...  
/** Submit event received from the presenter */
  onSubmit() {
    this.onSubmitForm.emit();
    // Check that there is no submit from the page/parent component
    if (!this.submitMe$) { // In this case we do not want to execute the submit logic, as it will be done when we submit from the page
      this.submitAction();
    }
  }

  /** submit function */
  submitAction() {
    // When submitting from page, call the function to mark the form in the presenter as dirty and touched
    // It is not necessary to be called each time we submit. It is important to be called if the form is pristine
    if (this.submitTrigger$) {
      this._markInteraction();
    }
    const isValid = !this.mainFormControl.errors;
    if (!this.mainFormControl.errors) {
      // put your submit logic here
    } else {
      const errors: FormError = {
        formId: `${this.id}-my-form-example`,
        errors: Object.keys(this.mainFormControl.errors).map((controlName: string) => {
          const controlErrors = this.mainFormControl.errors![controlName];
          return {htmlElementId: controlErrors.htmlElementId, errorMessages: controlErrors.errorMessages};
        })
      };
      this.store.dispatch(new UpsertFormErrorMessagesEntities({entities: [errors]}));
    }
    this.onSubmitted.emit(isValid);
  }
  
  /** Register the function to be called to mark the presenter as touched and dirty */
  registerInteraction(fn: () => void) {
    this._markInteraction = fn;
  }
  
  getFormsPocPresContext(overrideContext: Partial<FormsPocPresContextInput>): TemplateContext<FormsPocPresConfig, FormsPocPresContextInput, FormsPocPresContextOutput> {
    return {
      ...
      outputs: {
        onSubmit: this.onSubmit.bind(this),
        registerInteraction: this.registerInteraction.bind(this) // ---> save the output function handler in the component context
      },
      parentId: this.id,
      formControl: this.mainFormControl
    };
  }
```
