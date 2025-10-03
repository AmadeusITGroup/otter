import {
  Translation,
} from '@o3r/core';

export interface FormsEmergencyContactPresTranslation extends Translation {
  nameRequired: string;
  nameRequiredLong: string;
  phoneRequired: string;
  phoneRequiredLong: string;
  phonePattern: string;
  phonePatternLong: string;
  emailPattern: string;
  emailPatternLong: string;
}

export const translations: FormsEmergencyContactPresTranslation = {
  nameRequired: 'o3r-forms-emergency-contact-pres.name.required',
  nameRequiredLong: 'o3r-forms-emergency-contact-pres.name.required.long',
  phoneRequired: 'o3r-forms-emergency-contact-pres.phone.required',
  phoneRequiredLong: 'o3r-forms-emergency-contact-pres.phone.required.long',
  phonePattern: 'o3r-forms-emergency-contact-pres.phone.pattern',
  phonePatternLong: 'o3r-forms-emergency-contact-pres.phone.pattern.long',
  emailPattern: 'o3r-forms-emergency-contact-pres.email.pattern',
  emailPatternLong: 'o3r-forms-emergency-contact-pres.email.pattern.long'
};
