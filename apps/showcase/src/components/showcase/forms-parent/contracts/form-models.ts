/** Model used to create Personal Info form */
export interface PersonalInfo {
  /** Name */
  name: string;
  /** Date of birth */
  dateOfBirth: string;
}

/** Model used to create Emergency Contact form */
export interface EmergencyContact {
  /** Emergency contact name */
  name: string;
  /** Emergency contact phone number */
  phone: string;
  /** Emergency contact email address */
  email: string;
}
