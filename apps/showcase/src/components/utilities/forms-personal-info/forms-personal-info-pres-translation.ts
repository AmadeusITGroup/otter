import {
  Translation,
} from '@o3r/core';

export interface FormsPersonalInfoPresTranslation extends Translation {
  required: string;
  requiredLong: string;
  maxLength: string;
  maxLengthLong: string;
  date: string;
  dateLong: string;
  max: string;
  maxLong: string;
}

export const translations: FormsPersonalInfoPresTranslation = {
  required: 'o3r-forms-personal-info-pres.name.required',
  requiredLong: 'o3r-forms-personal-info-pres.name.required.long',
  maxLength: 'o3r-forms-personal-info-pres.name.maxLength',
  maxLengthLong: 'o3r-forms-personal-info-pres.name.maxLength.long',
  date: 'o3r-forms-personal-info-pres.dateOfBirth.date',
  dateLong: 'o3r-forms-personal-info-pres.dateOfBirth.date.long',
  max: 'o3r-forms-personal-info-pres.dateOfBirth.max',
  maxLong: 'o3r-forms-personal-info-pres.dateOfBirth.max.long'
};
