import {
  CommonModule,
  formatDate,
  JsonPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  type OnDestroy,
  type OnInit,
  Output,
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
  FlatError,
  getFlatControlErrors,
  markAllControlsDirtyAndTouched,
} from '@o3r/forms';
import {
  Localization,
  LocalizationModule,
  Translatable,
} from '@o3r/localization';
import {
  Subscription,
} from 'rxjs';
import {
  PersonalInfo,
} from '../../showcase/forms-parent/contracts';
import {
  DatePickerInputPresComponent,
} from '../date-picker-input';
import {
  FormsPersonalInfoPresConfig,
} from './forms-personal-info-pres.config';
import {
  FormsPersonalInfoPresTranslation,
  translations,
} from './forms-personal-info-pres.translation';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-personal-info-pres',
  standalone: true,
  imports: [
    CommonModule,
    DatePickerInputPresComponent,
    FormsModule,
    JsonPipe,
    LocalizationModule,
    ReactiveFormsModule
  ],
  templateUrl: './forms-personal-info-pres.template.html',
  styleUrl: './forms-personal-info-pres.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormsPersonalInfoPresComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormsPersonalInfoPresComponent),
      multi: true
    }
  ]
})
export class FormsPersonalInfoPresComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator, Translatable<FormsPersonalInfoPresTranslation> {
  private readonly subscription = new Subscription();

  /** Localization of the component */
  @Input()
  @Localization('./forms-personal-info-pres.localization.json')
  public translations: FormsPersonalInfoPresTranslation = translations;

  /** ID of the parent component used to compute the ids of the form controls */
  @Input() public id!: string;

  /** Input configuration to override the default configuration of the component */
  @Input() public config!: FormsPersonalInfoPresConfig;

  /** Custom validators applied on the form */
  @Input() public customValidators?: CustomFormValidation<PersonalInfo>;

  /** Register a function to be called when the submit is done outside of the presenter (from page) */
  @Output() public registerInteraction: EventEmitter<() => void> = new EventEmitter<() => void>();

  /** Emit when the submit has been fired on the form */
  @Output() public submitPersonalInfoForm: EventEmitter<void> = new EventEmitter<void>();

  protected changeDetector = inject(ChangeDetectorRef);

  /** Form group */
  public form: FormGroup<{
    name: FormControl<string | null>;
    dateOfBirth: FormControl<string | null>;
  }> = inject(FormBuilder).group({
      name: new FormControl<string>(''),
      dateOfBirth: new FormControl<string>(this.formatDate(Date.now()))
    });

  public componentSelector = 'o3r-forms-personal-info-pres';

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

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
    const globalValidators = [];
    if (this.customValidators && this.customValidators.global) {
      globalValidators.push(this.customValidators.global);
    }
    this.form.setValidators(globalValidators);

    // eslint-disable-next-line @typescript-eslint/unbound-method -- Validators are bound methods
    const nameValidators = [Validators.required];
    const dateOfBirthValidators = [];
    if (this.config?.nameMaxLength) {
      nameValidators.push(Validators.maxLength(this.config.nameMaxLength));
    }
    if (this.customValidators && this.customValidators.fields) {
      if (this.customValidators.fields.name) {
        nameValidators.push(this.customValidators.fields.name);
      }
      if (this.customValidators.fields.dateOfBirth) {
        dateOfBirthValidators.push(this.customValidators.fields.dateOfBirth);
      }
    }
    this.form.controls.name.setValidators(nameValidators);
    this.form.controls.dateOfBirth.setValidators(dateOfBirthValidators);
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
          htmlElementId: `${this.id}${controlFlatErrors.controlName || ''}`,
          errorMessages: (controlFlatErrors.customErrors || []).concat(
            controlFlatErrors.errors.map((error) => {
              const translationKey = `${this.componentSelector}.${controlFlatErrors.controlName || ''}.${error.errorKey}`;
              return {
                translationKey,
                longTranslationKey: this.translations[`${error.errorKey}Long`] || undefined,
                validationError: error.validationError,
                translationParams: this.getTranslationParamsFromFlatErrors(controlFlatErrors.controlName || '', error)
              };
            })
          )
        }
      };
    }, {});
  }

  /**
   * Create the translation parameters for each form control error
   * @param controlName
   * @param error
   */
  public getTranslationParamsFromFlatErrors(controlName: string, error: FlatError) {
    switch (controlName) {
      case 'dateOfBirth': {
        switch (error.errorKey) {
          case 'max': {
            return { max: error.errorValue.max };
          }
          default: {
            return {};
          }
        }
      }
      case 'name': {
        switch (error.errorKey) {
          case 'maxlength': {
            return { requiredLength: error.errorValue.requiredLength };
          }
          default: {
            return {};
          }
        }
      }
      default: {
        return {};
      }
    }
  }

  /** Submit emergency contact form */
  public submitForm() {
    markAllControlsDirtyAndTouched(this.form);
    this.form.updateValueAndValidity();
    this.submitPersonalInfoForm.emit();
  }
}
