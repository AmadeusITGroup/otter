/**
 * Common extra properties that are needed for all the Otter based store generations
 */
export interface ExtraFormattedProperties {

  /** Camelize name of the store to ensure consistency */
  storeName?: string;

  /** Camelized model name ex: example */
  cStoreName?: string;

  /** Indicates if the store interacts with an API */
  isAsync?: boolean;

  /** Indicates if the store contains a collection of items */
  isEntity?: boolean;

  /** Snake Case Upper model name ex: AIR_OFFER */
  scuStoreName?: string;

  /** Indicates if a SDK is going to be used */
  hasSDK: boolean;

  /** Indicates if a custom ID property (e.g. flightId) is used in the model */
  hasCustomId: boolean;

  /** Name of the model used in the store items */
  storeModelName: string;

  /** Name of the model used in the action payloads */
  payloadModelName: string;

  /** Snake Case Upper class name ex: EXAMPLE */
  scuClassName?: string;

  /** SDK reviver function */
  reviverModelName?: string;

  /** Model id field name */
  modelIdPropName?: string;

  /** File name */
  fileName?: string;
}
