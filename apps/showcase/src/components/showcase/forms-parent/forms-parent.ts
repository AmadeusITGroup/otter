import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  apply,
  form,
  FormField,
  maxLength,
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
} from '@o3r/transloco';
import {
  LanguagePipe,
  MarkdownComponent,
} from 'ngx-markdown';
import {
  FormsEmergencyContactPres,
  FormsPersonalInfoPres,
} from '../../utilities';
import {
  emergencyContactSchema,
} from '../../utilities/forms-emergency-contact/forms-emergency-contact-pres';
import {
  personalInfoSchema,
} from '../../utilities/forms-personal-info/forms-personal-info-pres';
import {
  EmergencyContact,
  PersonalInfo,
} from './contracts';
import {
  FormsParentTranslation,
  translations,
} from './forms-parent-translation';
import {
  dateCustomValidator,
  formsParentValidatorGlobal,
} from './forms-parent-validators';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-parent',
  imports: [
    FormsEmergencyContactPres,
    FormsPersonalInfoPres,
    FormField,
    LanguagePipe,
    MarkdownComponent
  ],
  templateUrl: '../forms-parent/forms-parent.html',
  styleUrl: './forms-parent.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsParent {
  /** Localization of the component */
  @Input()
  @Localization('./forms-parent-localization.json')
  public translations: FormsParentTranslation = translations;

  /** The combined model for both sub-forms */
  public parentModel = signal({
    personalInfo: { name: '', dateOfBirth: formatDate(Date.now(), 'yyyy-MM-dd', 'en-GB') },
    emergencyContact: { name: '', phone: '', email: '' }
  });

  /** The signal form tree binding to the model, with child schemas applied for parent-level validation */
  public parentForm = form(this.parentModel, (p) => {
    // Apply the reusable schemas from the child components so that
    // the parent's field tree reflects the children's validation state.
    apply(p.personalInfo, personalInfoSchema);
    apply(p.emergencyContact, emergencyContactSchema);

    // Additional parent-level validation for personalInfo
    maxLength(p.personalInfo.name, 5);

    // Custom validator: forbidden name on personal info (global)
    validate(p.personalInfo, ({ value }) => {
      const v = value();
      if (v.name === this.forbiddenName) {
        return { kind: 'forbiddenName', message: translations.globalForbiddenName };
      }
      return undefined;
    });

    // Custom validator: date must not be in the future
    validate(p.personalInfo.dateOfBirth, ({ value }) => {
      const dateStr = formatDate(value(), 'yyyy-MM-dd', 'en-GB');
      if (dateStr && dateStr > formatDate(Date.now(), 'yyyy-MM-dd', 'en-GB')) {
        return { kind: 'dateInFuture', message: translations.dateInThePast };
      }
      return undefined;
    });

    // Custom validator: forbidden name on emergency contact (global)
    validate(p.emergencyContact, ({ value }) => {
      const v = value();
      if (v.name === this.forbiddenName) {
        return { kind: 'forbiddenName', message: translations.globalForbiddenName };
      }
      return undefined;
    });
  });

  public submittedFormValue = '';

  public firstSubmit = true;
  public firstEmergencyContactFormSubmit = true;
  public firstPersonalInfoFormSubmit = true;

  private readonly forbiddenName = 'Test';

  /** Form validators for personal info (passed to child for internal display) */
  public personalInfoValidators: CustomFormValidation<PersonalInfo> = {
    global: formsParentValidatorGlobal(this.forbiddenName, translations.globalForbiddenName, translations.globalForbiddenNameLong, { name: this.forbiddenName }),
    fields: {
      dateOfBirth: dateCustomValidator(translations.dateInThePast)
    }
  };

  /** Form validators for emergency contact (passed to child for internal display) */
  public emergencyContactValidators: CustomFormValidation<EmergencyContact> = {
    global: formsParentValidatorGlobal(this.forbiddenName, translations.globalForbiddenName, translations.globalForbiddenNameLong, { name: this.forbiddenName })
  };

  /** submit function */
  public submitAction() {
    if (this.firstSubmit) {
      this.parentForm.personalInfo().markAsTouched();
      this.parentForm.personalInfo().markAsDirty();
      this.parentForm.emergencyContact().markAsTouched();
      this.parentForm.emergencyContact().markAsDirty();
      this.firstSubmit = false;
      this.firstPersonalInfoFormSubmit = false;
      this.firstEmergencyContactFormSubmit = false;
    }
    this.submitPersonalInfoForm();
    this.submitEmergencyContactForm();
    this.submittedFormValue = JSON.stringify(this.parentModel().personalInfo) + '\n' + JSON.stringify(this.parentModel().emergencyContact);
  }

  /** Submit personal info form */
  public submitPersonalInfoForm() {
    if (this.firstPersonalInfoFormSubmit) {
      this.parentForm.personalInfo().markAsTouched();
      this.parentForm.personalInfo().markAsDirty();
      this.firstPersonalInfoFormSubmit = false;
    }
    const isValid = !this.parentForm.personalInfo().invalid();
    if (isValid) {
      this.submittedFormValue = JSON.stringify(this.parentModel().personalInfo);
    }
  }

  /** Submit emergency contact form */
  public submitEmergencyContactForm() {
    if (this.firstEmergencyContactFormSubmit) {
      this.parentForm.emergencyContact().markAsTouched();
      this.parentForm.emergencyContact().markAsDirty();
      this.firstEmergencyContactFormSubmit = false;
    }
    const isValid = !this.parentForm.emergencyContact().invalid();
    if (isValid) {
      this.submittedFormValue = JSON.stringify(this.parentModel().emergencyContact);
    }
  }
}
