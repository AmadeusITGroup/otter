import {
  Configuration,
} from '@o3r/core';

/** Configuration of personal information */
export interface FormsPersonalInfoPresConfig extends Configuration {
  /** Requires the length of the name form control's value to be less than or equal to the provided number */
  nameMaxLength: number;
}
