import {
  AsyncPipe,
  CommonModule,
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import {
  O3rComponent,
} from '@o3r/core';
import {
  CustomFormValidation,
} from '@o3r/forms';
import {
  Localization,
} from '@o3r/localization';
import {
  LanguagePipe,
  MarkdownComponent,
} from 'ngx-markdown';
import {
  FormsEmergencyContactPresComponent,
  FormsPersonalInfoPresComponent,
} from '../../utilities';
import {
  EmergencyContact,
  PersonalInfo,
} from './contracts';
import {
  FormsParentTranslation,
  translations,
} from './forms-parent.translation';
import {
  dateCustomValidator,
  formsParentValidatorGlobal,
} from './forms-parent.validators';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-forms-parent',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    FormsEmergencyContactPresComponent,
    FormsPersonalInfoPresComponent,
    ReactiveFormsModule,
    LanguagePipe,
    MarkdownComponent
  ],
  templateUrl: '../forms-parent/forms-parent.template.html',
  styleUrl: './forms-parent.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsParentComponent {
  /** Localization of the component */
  @Input()
  @Localization('./forms-parent.localization.json')
  public translations: FormsParentTranslation = translations;

  /** The personal info form object model */
  public personalInfo: PersonalInfo = { name: '', dateOfBirth: this.formatDate(Date.now()) };
  /** The emergency contact form object model */
  public emergencyContact: EmergencyContact = { name: '', phone: '', email: '' };

  /** The form control object bind to the personal info component */
  public personalInfoFormControl: UntypedFormControl = new UntypedFormControl(this.personalInfo);
  /** The form control object bind to the emergency contact component */
  public emergencyContactFormControl: UntypedFormControl = new UntypedFormControl(this.emergencyContact);

  public submittedFormValue = '';

  public firstSubmit = true;
  public firstEmergencyContactFormSubmit = true;
  public firstPersonalInfoFormSubmit = true;

  private readonly forbiddenName = 'Test';

  /** Form validators for personal info */
  public personalInfoValidators: CustomFormValidation<PersonalInfo> = {
    global: formsParentValidatorGlobal(this.forbiddenName, translations.globalForbiddenName, translations.globalForbiddenNameLong, { name: this.forbiddenName }),
    fields: {
      dateOfBirth: dateCustomValidator(translations.dateInThePast)
    }
  };

  /** Form validators for emergency contact */
  public emergencyContactValidators: CustomFormValidation<EmergencyContact> = {
    global: formsParentValidatorGlobal(this.forbiddenName, translations.globalForbiddenName, translations.globalForbiddenNameLong, { name: this.forbiddenName })
  };

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }

  /** This will store the function to make the personal info form as dirty and touched */
  public _markPersonalInfoInteraction: () => void = () => {};
  /** This will store the function to make the emergency contact form as dirty and touched */
  public _markEmergencyContactInteraction: () => void = () => {};

  /**
   * Register the function to be called to mark the personal info form as touched and dirty
   * @param fn
   */
  public registerPersonalInfoInteraction(fn: () => void) {
    this._markPersonalInfoInteraction = fn;
  }

  /**
   * Register the function to be called to mark the personal emergency contact form as touched and dirty
   * @param fn
   */
  public registerEmergencyContactInteraction(fn: () => void) {
    this._markEmergencyContactInteraction = fn;
  }

  /** submit function */
  public submitAction() {
    if (this.firstSubmit) {
      this._markPersonalInfoInteraction();
      this._markEmergencyContactInteraction();
      this.firstSubmit = false;
      this.firstPersonalInfoFormSubmit = false;
      this.firstEmergencyContactFormSubmit = false;
    }
    this.submitPersonalInfoForm();
    this.submitEmergencyContactForm();
    this.submittedFormValue = JSON.stringify(this.personalInfoFormControl.value) + '\n' + JSON.stringify(this.emergencyContactFormControl.value);
  }

  /** Submit emergency contact form */
  public submitPersonalInfoForm() {
    if (this.firstPersonalInfoFormSubmit) {
      this._markPersonalInfoInteraction();
      this.firstPersonalInfoFormSubmit = false;
    }
    const isValid = !this.personalInfoFormControl.errors;
    if (isValid) {
      this.submittedFormValue = JSON.stringify(this.personalInfoFormControl.value);
      // eslint-disable-next-line no-console -- only logger available
      console.log('FORMS PARENT COMPONENT: personal info form status', this.personalInfoFormControl.status);
      // eslint-disable-next-line no-console -- only logger available
      console.log('FORMS PARENT COMPONENT: personal info form value', this.personalInfoFormControl.value);
    }
    // eslint-disable-next-line no-console -- only logger available
    console.log('FORMS PARENT COMPONENT: personal info form is valid:', isValid);
  }

  /** Submit emergency contact form */
  public submitEmergencyContactForm() {
    if (this.firstEmergencyContactFormSubmit) {
      this._markEmergencyContactInteraction();
      this.firstEmergencyContactFormSubmit = false;
    }
    const isValid = !this.emergencyContactFormControl.errors;
    if (isValid) {
      this.submittedFormValue = JSON.stringify(this.emergencyContactFormControl.value);
      // eslint-disable-next-line no-console -- only logger available
      console.log('FORMS PARENT COMPONENT: emergency contact form status', this.emergencyContactFormControl.status);
      // eslint-disable-next-line no-console -- only logger available
      console.log('FORMS PARENT COMPONENT: emergency contact form value', this.emergencyContactFormControl.value);
    }
    // eslint-disable-next-line no-console -- only logger available
    console.log('FORMS PARENT COMPONENT: emergency contact form is valid:', isValid);
  }
}
