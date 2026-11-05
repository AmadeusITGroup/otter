import {
  formatDate,
  JsonPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  input,
  model,
  output,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
} from '@angular/forms';
import {
  type FieldTree,
  form,
  FormField,
  type FormValueControl,
  maxLength,
  required,
  schema,
  type Schema,
  validate,
  type ValidationError,
} from '@angular/forms/signals';
import {
  O3rComponent,
} from '@o3r/core';
import {
  CustomFormValidation,
} from '@o3r/forms';
import {
  Localization,
  O3rLocalizationTranslatePipe,
  Translatable,
} from '@o3r/transloco';
import {
  PersonalInfo,
} from '../../showcase/forms-parent/contracts';
import {
  DatePickerInputPres,
} from '../date-picker-input';
import {
  FormsPersonalInfoPresConfig,
} from './forms-personal-info-pres-config';
import {
  FormsPersonalInfoPresTranslation,
  translations,
} from './forms-personal-info-pres-translation';

/**
 * Reusable schema for PersonalInfo validation.
 * Can be applied in parent forms via `apply(p.personalInfo, personalInfoSchema)`.
 *
 * Note: maxLength is not included here as it depends on a config input.
 * The parent should add maxLength separately or the child handles it internally.
 */
export const personalInfoSchema: Schema<PersonalInfo> = schema<PersonalInfo>((p) => {
  required(p.name);
});

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-personal-info-pres',
  imports: [
    DatePickerInputPres,
    FormField,
    JsonPipe,
    O3rLocalizationTranslatePipe
  ],
  templateUrl: './forms-personal-info-pres.html',
  styleUrl: './forms-personal-info-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsPersonalInfoPres implements FormValueControl<PersonalInfo>, Translatable<FormsPersonalInfoPresTranslation> {
  /** Localization of the component */
  @Input()
  @Localization('./forms-personal-info-pres-localization.json')
  public translations: FormsPersonalInfoPresTranslation = translations;

  /** ID of the parent component used to compute the ids of the form controls */
  public readonly id = input.required<string>();

  /** Input configuration to override the default configuration of the component */
  public readonly config = input.required<FormsPersonalInfoPresConfig>();

  /** Custom validators applied on the form */
  public readonly customValidators = input<CustomFormValidation<PersonalInfo>>();

  /** Emit when the submit has been fired on the form */
  public readonly submitPersonalInfoForm = output<void>();

  /** FormValueControl: the value model signal, kept in sync by [formField] */
  public readonly value = model<PersonalInfo>({ name: '', dateOfBirth: this.formatDate(Date.now()) });

  /** FormValueControl: output emitted to mark the field as touched */
  public readonly touch = output<void>();

  /** FormValueControl: input to receive the disabled status from the parent field */
  public readonly disabled = input<boolean>(false);

  /** Signal form tree with built-in validators, driven by the value model */
  public formTree: FieldTree<PersonalInfo> = form(this.value, (p) => {
    required(p.name);

    // Reactive maxLength based on config input
    maxLength(p.name, () => this.config()?.nameMaxLength ?? Infinity);

    // Custom validators from parent - global
    validate(p, ({ value }) => {
      const cv = this.customValidators();
      if (cv?.global) {
        const result = cv.global({ value: value() } as unknown as AbstractControl);
        if (result?.customErrors) {
          return result.customErrors.map((e: { translationKey: string }) => ({ kind: 'custom', message: e.translationKey }));
        }
      }
      return undefined;
    });

    // Custom validators from parent - field-level name
    validate(p.name, ({ value }) => {
      const cv = this.customValidators();
      if (cv?.fields?.name) {
        const result = cv.fields.name({ value: value() } as unknown as AbstractControl);
        if (result?.customErrors) {
          return result.customErrors.map((e: { translationKey: string }) => ({ kind: 'custom', message: e.translationKey }));
        }
      }
      return undefined;
    });

    // Custom validators from parent - field-level dateOfBirth
    validate(p.dateOfBirth, ({ value }) => {
      const cv = this.customValidators();
      if (cv?.fields?.dateOfBirth) {
        const result = cv.fields.dateOfBirth({ value: value() } as unknown as AbstractControl);
        if (result?.customErrors) {
          return result.customErrors.map((e: { translationKey: string; translationParams?: Record<string, unknown> }) => ({
            kind: 'custom',
            message: e.translationKey,
            translationParams: e.translationParams
          }));
        }
      }
      return undefined;
    });
  });

  public componentSelector = 'o3r-forms-personal-info-pres';

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  /**
   * Create the translation parameters for each form control error
   * @param controlName
   * @param error
   */
  public getTranslationParamsFromError(controlName: string, error: ValidationError.WithFieldTree) {
    switch (controlName) {
      case 'dateOfBirth': {
        switch (error.kind) {
          case 'max': {
            return { max: (error as unknown as { max?: unknown }).max };
          }
          default: {
            return {};
          }
        }
      }
      case 'name': {
        switch (error.kind) {
          case 'maxLength': {
            return { requiredLength: (error as unknown as { maxLength?: unknown }).maxLength };
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

  /** Submit personal info form */
  public submitForm() {
    this.formTree().markAsTouched();
    this.formTree().markAsDirty();
    this.touch.emit();
    this.submitPersonalInfoForm.emit();
  }

  /**
   * Extract custom errors from a field tree node for template display.
   * Custom errors have kind 'custom' and carry translationKey in the message field.
   * @param fieldTree
   */
  public getCustomErrors(fieldTree: FieldTree<string>): { translationKey: string; translationParams: Record<string, unknown> }[] {
    return fieldTree().errors()
      .filter((e) => e.kind === 'custom')
      .map((e) => ({
        translationKey: e.message ?? '',
        translationParams: (e as unknown as { translationParams?: Record<string, unknown> }).translationParams ?? {}
      }));
  }
}
