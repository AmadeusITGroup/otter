import type {
  Translation,
} from '@o3r/core';

export interface LocalizationPresTranslation extends Translation {
  /**
   * Key for the message in the speech bubble until a destination is selected
   */
  welcome: string;
  /**
   * Key for the message in the speech bubble when a destination is selected, you can use `{ cityName }` to display the name of the city selected
   */
  welcomeWithCityName: string;
  /**
   * Key for the question at the top of the form
   */
  question: string;
  /**
   * Key for the label for the destination input
   */
  destinationLabel: string;
  /**
   * Key for the label for the departure date input
   */
  departureLabel: string;
  /**
   * Key for the placeholder for the destination input
   */
  destinationPlaceholder: string;
  /**
   * Key for the city names' dictionary
   */
  cityName: string;
}

export const translations: LocalizationPresTranslation = {
  welcome: 'o3r-localization-pres.welcome',
  welcomeWithCityName: 'o3r-localization-pres.welcomeWithCityName',
  question: 'o3r-localization-pres.question',
  destinationLabel: 'o3r-localization-pres.destinationLabel',
  departureLabel: 'o3r-localization-pres.departureLabel',
  cityName: 'o3r-localization-pres.cityName',
  destinationPlaceholder: 'o3r-localization-pres.destinationPlaceholder'
};
