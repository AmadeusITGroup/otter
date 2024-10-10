import type { Translation } from '@o3r/core';

export interface RulesEnginePresTranslation extends Translation {
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
  /**
   * Key for the label for the return date input
   */
  returnLabel: string;
}
export const translations = {
  welcome: 'o3r-rules-engine-pres.welcome',
  welcomeWithCityName: 'o3r-rules-engine-pres.welcomeWithCityName',
  question: 'o3r-rules-engine-pres.question',
  destinationLabel: 'o3r-rules-engine-pres.destinationLabel',
  departureLabel: 'o3r-rules-engine-pres.departureLabel',
  cityName: 'o3r-rules-engine-pres.cityName',
  returnLabel: 'o3r-rules-engine-pres.returnLabel',
  destinationPlaceholder: 'o3r-rules-engine-pres.destinationPlaceholder'
} as const satisfies RulesEnginePresTranslation;
