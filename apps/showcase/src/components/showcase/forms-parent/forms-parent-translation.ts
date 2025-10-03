import {
  Translation,
} from '@o3r/core';

export interface FormsParentTranslation extends Translation {
  dateInThePast: string;
  globalForbiddenName: string;
  globalForbiddenNameLong: string;
}

export const translations: FormsParentTranslation = {
  dateInThePast: 'o3r-forms-parent.dateOfBirth.dateInThePast',
  globalForbiddenName: 'o3r-forms-parent.globalForbiddenName',
  globalForbiddenNameLong: 'o3r-forms-parent.globalForbiddenName.long'
};
