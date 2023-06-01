/* eslint-disable @typescript-eslint/naming-convention */

import { BuildTimeProperties } from '@o3r/core';
import { ApplicationProperties } from './type';

/** Environment properties */
export const environment: Readonly<BuildTimeProperties & ApplicationProperties> = {
  production: true,
  DEBUG_MODE: false,
  APP_BASE_HREF: '.',
  APP_VERSION: '0.0.0',
  DEFAULT_LOC_BUNDLE_NAME: '',
  DEVTOOL_HISTORY_SIZE: 20,
  ENABLE_GHOSTING: false,
  ENABLE_WEBSTORAGE: false,
  ENVIRONMENT: 'prod',
  LOCALIZATION_BUNDLES_OUTPUT: 'localizations/',
  USE_MOCKS: false
} as const;

export const additionalModules = [];
