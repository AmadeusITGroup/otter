import {
  InjectionToken,
} from '@angular/core';
import {
  LocalizationDevtoolsServiceOptions,
} from './localization-devkit-interface';

/**
 * Default configuration options for the Otter Localization Devtools
 */
export const OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS: Readonly<LocalizationDevtoolsServiceOptions> = {
  isActivatedOnBootstrap: false,
  isActivatedOnBootstrapWhenCMSContext: true,
  metadataFilePath: './metadata/localisation.metadata.json'
} as const;

/**
 * Injection token for Otter Localization Devtools configuration options
 */
export const OTTER_LOCALIZATION_DEVTOOLS_OPTIONS = new InjectionToken<LocalizationDevtoolsServiceOptions>('Otter Localization Devtools options');
