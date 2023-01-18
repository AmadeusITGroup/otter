[Forms structure](#form-structure)
  1. [Container/presenter and reactive forms](#container-presenter)
      1. [Form creation in container or in presenter?](#form-creation)
      2. [Data exchange between container and presenter](#data-exchange)
        1. [Basic case](#data-exchange-basic)
        2. [Complex case](#data-exchange-complex)
      3. [Component Creation](#component-creation)
        1. [Basic case](#basic-case)
        2. [Adding complexity ](#adding-complexity)
            1. [Basic structure](#basic-structure)
            2. [Include Basic validation](#basic-validation)
                1. [Validators definition](#validators-definition)
                2. [Apply validators ](#apply-validators)
                3. [Validators translations](#validators-translation)
            3. [Include Custom Validations](#custom-validators)
                1. [Validators definition](#custom-validators-definition)
                2. [Apply validators ](#custom-apply-validators)
                3. [Validators translations](#custom-validators-translations) 

<a name="form-structure"></a>
# Forms structure

Angular provides two approaches for writing the forms, [template-driven forms](https://angular.io/guide/forms) and [model-driven or reactive forms](https://angular.io/guide/reactive-forms).  
This documentation will help you with some best practices to be used at the build of angular reactive forms components in Otter context.

<a name="container-presenter"></a>
## [Container/presenter](../components/COMPONENT_STRUCTURE.md) and reactive forms
Container/presenter architecture was put in place to ensure the best reusability/sharing 
<a name="form-creation"></a>
### Form creation in container or in presenter?

* The __form creation__ (it can be a [__FormGroup__](https://angular.io/api/forms/FormGroup) or [__FormArray__](https://angular.io/api/forms/FormArray) or [__FormControl__](https://angular.io/api/forms/FormControl)) should be done __in the presenter__ because:  
   * it's up to the presenter to decide how the data will be displayed/computed. An example is a date which can be displayed in one input field 
  ([FormControl](https://angular.io/api/forms/FormControl)) in one presenter, or in one [FormGroup](https://angular.io/api/forms/FormGroup) containing 3 FormControls, corresponding to 3 input fields, in other presenter (the container needs only a date).  
   * we will not use the formGroup / formArray / formControl object as a two-way data binding object between the container and the presenter.  
* The __container__ needs only the value and in some specific cases the errors propagated from the presenter. If needed it can set the default value  

From now on we will refer as __form presenter object__ the __formGroup__ or __formArray__ or __formControl__ created in the presenter.

<a name="data-exchange"></a>
### Data exchange between container and presenter in forms context
<a name="data-exchange-basic"></a>
#### Simple cases
The need in this case is to display the inline errors, check the form validity and emit the form value.
* The presenter containing the form should:
  * handle the display of form errors
  * trigger the form submit
  * check the form validity
  * use an event emitter to propagate the form value to the container
* The container should intercept the propagated value and execute the submit logic  
<a name="data-exchange-complex"></a>
#### Complex cases
This case includes the simple case plus the display of a messages panel containing the form errors and the flexibility to submit from the presenter or from the page. 
* The presenter containing the form should:
   * implement [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor). It will propagate all the __value/status changes__ done inside the __presenter form object__ to the parent, in our case the container.
    In this way it will behave as an __HTML input element__ on which we can __apply__ the [ngModel](https://angular.io/api/forms/NgModel) directive or we can bind a [FormControl](https://angular.io/api/forms/FormControl#description). 
   * implement [Validator](https://angular.io/api/forms/Validator) interface, if your form validators are only synchronous or [AsyncValidator](https://angular.io/api/forms/AsyncValidator) interface if the form needs asynchronous validators. See [FORM_VALIDATION](./FORM_VALIDATION.md) for more details about validation in Otter.  
      * Implementing this interface gives us the possibility to define, in the __validate__ method, the error object model which will be propagated to the parent/container. See [FORM_ERRORS](./FORM_ERRORS.md) for details. 
* The container will apply a [Form Control Directive](https://angular.io/api/forms/FormControlDirective) to the presenter form to have the possibility to:
   * set the default value for the presenter form object if needed. 
   * listen to the valueChanges if needed
   * listen status changes if needed
   * easily get the errors propagated by the presenter  

We prefer to use the __formControl__ rather than __ngModel__ because we can easily listen to the valueChanges or status changes of the presenter form.
Another constraint is that it's easier to identify the container context for the CMS, with one implementation (See [Component Structure](../components/COMPONENT_STRUCTURE.md) for details about the component context).

<a name="component-creation"></a>
### Component creation 
__Component__ here, refers a container and a presenter components.

<a name="basic-case"></a>
#### Basic case
In this case the only need we have is to implement a form, display the inline errors, check the form validity and do something with the form value.  
In this case for the presenter:
* __form__ is __created__ here
* __validators__ applied here (see [FORM_VALIDATION](./FORM_VALIDATION.md) for details and validator types, where they are created)
* __inline errors__ are handled here (see [FORM_ERRORS](./FORM_ERRORS.md) for details about the error messages translations)
* form validity will be checked here
* it will trigger the submission and emit the form value  

The container:
* capture the form value emitted
* execute the submit logic 

The difference from the default implementation of the [forms in angular](https://angular.io/guide/reactive-forms) is that we have to emit the form value from the container to the presenter, 
using an [@Output](https://angular.io/api/core/Output) event. 
Another difference might be related to the custom validators, which we are suggesting to be created in the container because they can be related to the business logic 
(Please have a look at the dedicated section for the forms validators: [FORM_VALIDATION](./FORM_VALIDATION.md)). 

<a name="adding-complexity"></a>
#### Adding complexity
In addition to the simple case, if we need an __error message__ panel, which can be displayed anywhere in the page,
or we need  __form submission__, done from the page, we came up with the following implementation.   

<a name="basic-structure"></a>
##### 1.Basic structure      
The form created in the presenter and the default value should have the same contract. The contract of a form is an interface which defines the form controls names and the type of the value which should be handled by each control. See the example of a component creation. 

The example is based on a form used to introduce data for a Traveler object
* Define the contract object 
```typescript
// form object contract
export interface Traveler {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}
``` 
 * __Container__ class
   * Create a form control to set the binding and the default data.  

```typescript
// in container class

  mainFormControl: FormControl;   

  constructor(config: FormsPocContConfig, private store: Store<FormErrorMessagesStore>) {
      ...
      // Default value
      this.traveler: Traveler = {firstName: '', lastName: 'TestUser', dateOfBirth: new Date()};
      // define the form control which will be bound to presenter with default value
      this.mainFormControl = new FormControl(this.traveler);
      ...
  }

ngOnInit() {
    this.subscriptions.push(
      // Subscribe to any change done to the value of the form control applied to the presenter 
      this.mainFormControl.valueChanges.subscribe((value) => console.log(value)),
      // Subscribe to the status change of the form control applied to the presenter 
      this.mainFormControl.statusChanges.subscribe((value) => console.log(value))
    );
  }
``` 
  
   * Register the form control in the template context to be recognized if we change the presenter. See [COMPONENT_STRUCTURE](../components/COMPONENT_STRUCTURE.md) for details about the template context.

```typescript   
// in container class
  getFormsPocPresContext(overrideContext: Partial<FormsPocPresContextInput>): TemplateContext<FormsPocPresConfig, FormsPocPresContextInput, FormsPocPresContextOutput> {
    return {
      config: this.config.presFormsPocConfig || new FormsPocPresConfig(),
      inputs: {
        validators: this.validators,  // ---> the validators applied to the form; we'll see this later
        ...overrideContext
      },
      outputs: {
        onSubmit: this.onSubmit.bind(this),
        registerInteraction: this.registerInteraction.bind(this)
      },
      parentId: this.id, // ---> this id will be used by the presenter to create html element id's for the form controls inside (it has to be unique)
      formControl: this.mainFormControl // ---> this filed is keeping the 'mainFormControl' object in the context. It is not used by the presenter
    };
  }
```
* Container template 
```html
<!-- html template for the container --> 
<ng-template #defaultTemplateFormsPocPres let-inputs="inputs" let-config="config" let-outputs="outputs" let-parentId="parentId"
  let-formControl="formControl"> <!-- 'formControl' is the context field which keeps the formControl -->
    <mat-card>
      <o3r-forms-poc-pres
        [attr.id]="parentId + 'FormsPoc'"
        [id]="parentId + 'FormsPoc'"
        [config]="config"
        [formName]="inputs.formName"
        (onSubmit)="outputs.onSubmit($event)"
        (registerInteraction)="outputs.registerInteraction($event)"
        [validators]="forms.formsPoc.validators"
        [formControl]="formControl">  <!-- this is the formControl directive applied on the 'o3r-forms-poc-pres' HTML element. It is not an @Input for the presenter -->
      </o3r-forms-poc-pres>
    </mat-card>
</ng-template>
<ng-container [ngTemplateOutlet]="templateFormsPocPres || defaultTemplateFormsPocPres"
              [ngTemplateOutletContext]="formsPocPresContext$ | async">
</ng-container>
```
* __Presenter__ class 
   * Here we have to create the formGroup/formArray/formControl object
   * Provide [NG_VALUE_ACCESSOR](https://angular.io/api/forms/NG_VALUE_ACCESSOR) - used to provide a [ControlValueAccessor](https://angular.io/api/forms/DefaultValueAccessor) for form controls, to write a value and listening to changes on input elements.
   * Provide [NG_VALIDATORS](https://angular.io/api/forms/NG_VALIDATORS) This is an [InjectionToken](https://angular.io/api/core/InjectionToken) for registering additional synchronous validators used with forms.
```typescript
// in presenter class
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
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormsPocPresComponent),
      multi: true
    }
  ]
})
export class FormsPocPresComponent implements OnInit, Validator, FormsPocPresContext, ControlValueAccessor, Configurable<FormsPocPresConfig>, OnDestroy {
  /** Localization of the component */
  @Input()
  @Localization('./forms-poc-pres.localization.json')
  public translations: FormsPocPresTranslation;

  /** Object used to compute the ids of the form controls */
  @Input() id: string;

  /** Configuration of the component */
  @Input() public config: FormsPocPresConfig;

  /** Custom validators applied on the form */
  @Input() customValidators?: CustomFormValidation<Traveler>;  // See more in ./FORM_VALIDATION.md

  /** Emit an event when the submit has been fired on the form */
  @Output() onSubmit: EventEmitter<void> = new EventEmitter<void>(); // See more in ./FORM_SUBMIT_AND_INTERCOMMUNICATION.md

  /** Register a function to be called when the submit is done outside of the presenter (from page) */
  @Output() registerInteraction: EventEmitter<() => void> = new EventEmitter<() => void>(); // See more in ./FORM_SUBMIT_AND_INTERCOMMUNICATION.md

  /** The form object */ 
  travelerForm: FormGroup;

  constructor() {
    // Create the form having the Traveler contract
    this.travelerForm = this.fb.group({
      firstName: null,
      lastName: null,
      dateOfBirth: null
    });
  }
  
  ngOnInit() {
    ...
    this.subscriptions.push(
      this.travelerForm.valueChanges
        .pipe(
          map((value) => {
            const traveler: Traveler = {firstName: value.firstName, lastName: value.lastName, dateOfBirth: value.dateOfBirth};
            return traveler;
          })
        )
        .subscribe((value) => {
          this.propagateChange(value); // ---> Propagate the value to the parent
        })
    );
    ...
  }  
  ...
  /** @inheritDoc 
  * Called when setting form value
  */
  writeValue(value?: any) {
    if (value) {
      this.travelerForm.setValue(value);
    }
  }
  ...
  /** @inheritDoc
   * Return the errors for the validators applied global to the form plus the errors for each field
   */
  public validate(_control: AbstractControl): ValidationErrors | null {
    ... // ----> See ./FORM_ERRORS.md for the implementation of this method
  }
}
```
* __Submit and Intercommunication__   

In Otter context we have to handle specific cases for form submit and communication between __presenter/container/page__  
For the submit action we have to support 2 cases:
* __submit from page__ (app level) - there is no submit button in the presenter and the submit action is triggered at application level
  * The __page__ triggers submit action > __Container__ receives the signal and executes the submit logic. Emits an event when the submit logic is finished.

  This is useful when you have multiple forms on a page and you want to trigger the submit for all in the same time.  
* __submit from presenter__ - the submit button is displayed
  * __Presenter__ - click on submit btn and emits an event > __Container__ receives the signal and executes the submit logic. Emits an event when the submit logic is finished.  
  
This section is explained in details in [FORM_SUBMIT&INTERCOMMUNICATION](./FORM_SUBMIT_AND_INTERCOMMUNICATION.md) section.

<a name="basic-validation"></a>    
##### 2. Include Basic validation
The validations on the form are improving overall data quality by validating user input for accuracy and completeness.  
We are keeping the concept of validators from angular forms. Please see [FormValidation](https://angular.io/guide/form-validation) and [Validators](https://angular.io/api/forms/Validators) in angular for more details.  
  
In Otter context we call the __basic or primitive__, the validators which are using primitive values (string, number, booleans) as inputs for the validation function.  

This validators are defined and applied at presenter level. They can be set at form creation or later, depending on the use cases.
Validators values are given as a configuration on the presenter. This gave us the possibility to use the presenter with different set of validators.

<a name="validators-definition"></a> 
###### Validators definition
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
###### Apply validators 

  * __on presenter html__  
In the use case where we need to display inline errors, we have to apply directives corresponding to the validators on the html template (when it is possible), because angular material needs the directives for the display of inline errors
```html
<!-- Configurable 'required' validator applied directly on the template.  -->
<input matInput formControlName="firstName" [required]="config.firstNameRequired" [id]="id + 'firstName'">
```
  * __on presenter class__
```typescript
  this.subscriptions.push(
    this.config$.subscribe((config) => {
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
    })
  );
```  

<a name="validators-translation"></a> 
###### Validators translations
For each defined validator we need a corresponding translation key for the error message. This keys have to be defined in the corresponding __localization.json__ file of the __presenter__. In this way the presenter is aware about it's own validations/error messages.  

See [FORM_VALIDATIONS](./FORM_VALIDATION.md) for more details.

<a name="custom-validators"></a>
##### 3. Include Custom Validations
Since the built-in validators won't always match the exact use case of your application, sometimes you'll want to create a custom validator. See [Custom Validators](https://angular.io/guide/form-validation#custom-validators) in angular.  
Our custom validators are usually related to the business logic or, they are applied to multiple fields/form controls.  
As they are related to the business logic we will create them in the __container__ and pass them to the presenter via an input. The presenter is the one which applies them on the form.  

<a name="custom-validators-definition"></a> 
###### Validators definition 
The validation function can be defined anywhere but it has to be added to the validators object in the container.
* Validation function
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
* Container
```typescript
... 
ngOnInit() {
  this.validators = { // See more about validators type in ./FORM_VALIDATION.md
    global: formsPocValidatorGlobal(this.config.forbiddenName, translations.globalForbiddenName, `${translations.globalForbiddenName}.long`, {name: 'Test'}),
    fields: {dateOfBirth: dateCustomValidator(translations.dateInThePast)  }
  };
...
  getFormsPocPresContext(overrideContext: Partial<FormsPocPresContextInput>): TemplateContext<FormsPocPresConfig, FormsPocPresContextInput, FormsPocPresContextOutput> {
  return {
    ...
    inputs: {
      validators: this.validators // ---> the validators sent to be applied on the presenter;
    },
    ...
  };
  }
```

<a name="custom-apply-validators"></a> 
###### __Apply__ validators:
The validators are applied to the form on the __presenter__ class.
```typescript
/** Custom validators applied on the form */
  @Input() customValidators?: CustomFormValidation<Traveler>;
  
  ngOnInit() {
    ...
    const firstNameValidators = []; // Validators for the firstName
    if (this.config.firstNameMaxLength) { // Primivite validator
      // Apply validator based on config
      firstNameValidators.push(Validators.maxLength(this.config.firstNameMaxLength));
    }
    // Apply custom validation
    if (this.customValidators && this.customValidators.fields && this.customValidators.fields.firstName) {
      firstNameValidators.push(this.customValidators.fields.firstName); 
    }
    this.travelerForm.controls.firstName.setValidators(firstNameValidators);
  }
```

<a name="custom-validators-translations"></a> 
###### Validators translations
For each custom validator we need a corresponding translation key for the error message. 
As they are defined in the container, the keys have to be defined in the corresponding __localization.json__ file of the __container__. 
In this way the container knows about it's own validations/error messages.  

See [FORM_VALIDATIONS](./FORM_VALIDATION.md) for more details.


