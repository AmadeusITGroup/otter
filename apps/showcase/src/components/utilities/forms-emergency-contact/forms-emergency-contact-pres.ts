import {
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
  email as emailValidator,
  type FieldTree,
  form,
  FormField,
  type FormValueControl,
  pattern,
  required,
  schema,
  type Schema,
  validate,
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
  EmergencyContact,
} from '../../showcase/forms-parent/contracts';
import {
  FormsEmergencyContactPresTranslation,
  translations,
} from './forms-emergency-contact-pres-translation';

/**
 * Reusable schema for EmergencyContact validation.
 * Can be applied in parent forms via `apply(p.emergencyContact, emergencyContactSchema)`.
 */
export const emergencyContactSchema: Schema<EmergencyContact> = schema<EmergencyContact>((p) => {
  required(p.name);
  required(p.phone);
  pattern(p.phone, /^[0-9]{10}$/);
  emailValidator(p.email);
});

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-emergency-contact-pres',
  imports: [
    FormField,
    JsonPipe,
    O3rLocalizationTranslatePipe
  ],
  templateUrl: './forms-emergency-contact-pres.html',
  styleUrl: './forms-emergency-contact-pres.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsEmergencyContactPres implements FormValueControl<EmergencyContact>, Translatable<FormsEmergencyContactPresTranslation> {
  /** Localization of the component */
  @Input()
  @Localization('./forms-emergency-contact-pres-localization.json')
  public translations: FormsEmergencyContactPresTranslation = translations;

  /** ID of the parent component used to compute the ids of the form controls */
  public readonly id = input.required<string>();

  /** Custom validators applied on the form */
  public readonly customValidators = input<CustomFormValidation<EmergencyContact>>();

  /** Emit when the submit has been fired on the form */
  public readonly submitEmergencyContactForm = output<void>();

  /** FormValueControl: the value model signal, kept in sync by [formField] */
  public readonly value = model<EmergencyContact>({ name: '', phone: '', email: '' });

  /** FormValueControl: output emitted to mark the field as touched */
  public readonly touch = output<void>();

  /** FormValueControl: input to receive the disabled status from the parent field */
  public readonly disabled = input<boolean>(false);

  /** Signal form tree with built-in validators, driven by the value model */
  public formTree: FieldTree<EmergencyContact> = form(this.value, (p) => {
    required(p.name);
    required(p.phone);
    pattern(p.phone, /^[0-9]{10}$/);
    emailValidator(p.email);

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

    // Custom validators from parent - field-level phone
    validate(p.phone, ({ value }) => {
      const cv = this.customValidators();
      if (cv?.fields?.phone) {
        const result = cv.fields.phone({ value: value() } as unknown as AbstractControl);
        if (result?.customErrors) {
          return result.customErrors.map((e: { translationKey: string }) => ({ kind: 'custom', message: e.translationKey }));
        }
      }
      return undefined;
    });

    // Custom validators from parent - field-level email
    validate(p.email, ({ value }) => {
      const cv = this.customValidators();
      if (cv?.fields?.email) {
        const result = cv.fields.email({ value: value() } as unknown as AbstractControl);
        if (result?.customErrors) {
          return result.customErrors.map((e: { translationKey: string }) => ({ kind: 'custom', message: e.translationKey }));
        }
      }
      return undefined;
    });
  });

  public componentSelector = 'o3r-forms-emergency-contact-pres';

  /** Submit emergency contact form */
  public submitForm() {
    this.formTree().markAsTouched();
    this.formTree().markAsDirty();
    this.touch.emit();
    this.submitEmergencyContactForm.emit();
  }
}
