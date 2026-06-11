import {
  CommonModule,
  JsonPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  input,
  type OnDestroy,
  type OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import {
  O3rComponent,
} from '@o3r/core';
import {
  ControlFlatErrors,
  CustomFormValidation,
  getFlatControlErrors,
  markAllControlsDirtyAndTouched,
} from '@o3r/forms';
import {
  Localization,
  O3rLocalizationTranslatePipe,
  Translatable,
} from '@o3r/transloco';
import {
  Subscription,
} from 'rxjs';
import {
  EmergencyContact,
} from '../../showcase/forms-parent/contracts';
import {
  FormsEmergencyContactPresTranslation,
  translations,
} from './forms-emergency-contact-pres-translation';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-emergency-contact-pres',
  imports: [
    CommonModule,
    FormsModule,
    JsonPipe,
    O3rLocalizationTranslatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './forms-emergency-contact-pres.html',
  styleUrl: './forms-emergency-contact-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormsEmergencyContactPres),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormsEmergencyContactPres),
      multi: true
    }
  ]
})
export class FormsEmergencyContactPres implements OnInit, OnDestroy, ControlValueAccessor, Validator, Translatable<FormsEmergencyContactPresTranslation> {
  private readonly subscription = new Subscription();

  /** Localization of the component */
  @Input()
  @Localization('./forms-emergency-contact-pres-localization.json')
  public translations: FormsEmergencyContactPresTranslation = translations;

  /** ID of the parent component used to compute the ids of the form controls */
  public readonly id = input.required<string>();

  /** Custom validators applied on the form */
  public readonly customValidators = input<CustomFormValidation<EmergencyContact>>();

  /** Register a function to be called when the submit is done outside of the presenter (from page) */
  public registerInteraction = output<() => void>();

  /** Emit when the submit has been fired on the form */
  public submitEmergencyContactForm = output<void>();

  protected changeDetector = inject(ChangeDetectorRef);

  /** Form group */
  public form: FormGroup<{
    name: FormControl<string | null>;
    phone: FormControl<string | null>;
    email: FormControl<string | null>;
  }> = inject(FormBuilder).group({
    name: new FormControl<string>(''),
    phone: new FormControl<string>(''),
    email: new FormControl<string>('')
  });

  public componentSelector = 'o3r-forms-emergency-contact-pres';

  public ngOnInit() {
    this.applyValidation();
    this.subscription.add(this.form.valueChanges.subscribe((value) => this.propagateChange(value)));
    this.registerInteraction.emit(() => {
      markAllControlsDirtyAndTouched(this.form);
      this.changeDetector.markForCheck();
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /** @inheritDoc */
  public writeValue(value?: any) {
    if (value) {
      this.form.setValue(value);
    }
  }

  /** Function registered to propagate a change to the parent */
  public propagateChange: any = () => {};
  /** Function registered to propagate touched to the parent */
  public propagateTouched: any = () => {};

  /** @inheritDoc */
  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  /** @inheritDoc */
  public registerOnTouched(fn: any) {
    this.propagateTouched = fn;
  }

  /**
   * Get custom validators and primitive validators and apply them on the form
   */
  public applyValidation() {
    const customValidators = this.customValidators();
    const globalValidators = [];
    if (customValidators && customValidators.global) {
      globalValidators.push(customValidators.global);
    }
    this.form.setValidators(globalValidators);

    /* eslint-disable @typescript-eslint/unbound-method -- Validators are bound methods */
    const nameValidators = [Validators.required];
    const phoneValidators = [Validators.required, Validators.pattern('^[0-9]{10}$')];
    const emailValidators = [Validators.email];
    /* eslint-enable @typescript-eslint/unbound-method */
    if (customValidators && customValidators.fields) {
      if (customValidators.fields.name) {
        nameValidators.push(customValidators.fields.name);
      }
      if (customValidators.fields.phone) {
        phoneValidators.push(customValidators.fields.phone);
      }
      if (customValidators.fields.email) {
        emailValidators.push(customValidators.fields.email);
      }
    }
    this.form.controls.name.setValidators(nameValidators);
    this.form.controls.phone.setValidators(phoneValidators);
    this.form.controls.email.setValidators(emailValidators);
    this.form.updateValueAndValidity();
  }

  /**
   * @inheritDoc
   */
  public validate(_control: AbstractControl): ValidationErrors | null {
    if (this.form.status === 'VALID') {
      return null;
    }

    const formErrors = getFlatControlErrors(this.form);

    return formErrors.reduce((errorsMap: ValidationErrors, controlFlatErrors: ControlFlatErrors) => {
      return {
        ...errorsMap,
        [controlFlatErrors.controlName || 'global']: {
          htmlElementId: `${this.id()}${controlFlatErrors.controlName || ''}`,
          errorMessages: (controlFlatErrors.customErrors || []).concat(
            controlFlatErrors.errors.map((error) => {
              const translationKey = `${this.componentSelector}.${controlFlatErrors.controlName || ''}.${error.errorKey}`;
              return {
                translationKey,
                longTranslationKey: this.translations[`${error.errorKey}Long`] || undefined,
                validationError: error.validationError
              };
            })
          )
        }
      };
    }, {});
  }

  /** Submit emergency contact form */
  public submitForm() {
    markAllControlsDirtyAndTouched(this.form);
    this.form.updateValueAndValidity();
    this.submitEmergencyContactForm.emit();
  }
}
