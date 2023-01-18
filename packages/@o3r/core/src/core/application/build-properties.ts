/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Library build time properties
 */
export interface BuildTimeProperties {
  /**
   * True if the application in launch in debug mode
   */
  DEBUG_MODE: boolean;

  /**
   * True if the webStorage option is enabled
   */
  ENABLE_WEBSTORAGE: boolean;

  /**
   * Name of the current environment
   */
  ENVIRONMENT: string;

  /**
   * Boolean that can be used to activate API calls mocks for development or mock-up purpose.
   */
  USE_MOCKS: boolean;

  /**
   * Maximum size of the dev tool history
   */
  DEVTOOL_HISTORY_SIZE: number | undefined;

  /**
   * path to bundles in published folder
   */
  LOCALIZATION_BUNDLES_OUTPUT: string;

  /**
   * The name of the bundle generated with the default localization components keys
   */
  DEFAULT_LOC_BUNDLE_NAME: string;

  /**
   * Indicates the default server prefix to be used in case no dynamic is found
   */
  APP_BASE_HREF: string | undefined;

  /**
   * Version of the App based on the package.json
   */
  APP_VERSION: string;

  /**
   * Determine if the ghosting is activated on the app
   */
  ENABLE_GHOSTING: boolean;
}

/**
 * Library build time default properties
 */
export const DEFAULT_BUILD_PROPERTIES: BuildTimeProperties = {
  DEBUG_MODE: true,
  APP_BASE_HREF: '.',
  APP_VERSION: '0.0.0',
  DEFAULT_LOC_BUNDLE_NAME: '',
  DEVTOOL_HISTORY_SIZE: 20,
  ENABLE_GHOSTING: false,
  ENABLE_WEBSTORAGE: true,
  ENVIRONMENT: 'dev',
  LOCALIZATION_BUNDLES_OUTPUT: 'localizations/',
  USE_MOCKS: false
};
