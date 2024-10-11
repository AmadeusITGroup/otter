import { InjectionToken } from '@angular/core';
import { LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';

export const OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS = {
  isActivatedOnBootstrap: false,
  isActivatedOnBootstrapWhenCMSContext: true,
  metadataFilePath: './metadata/localisation.metadata.json'
} as const satisfies LocalizationDevtoolsServiceOptions;

export const OTTER_LOCALIZATION_DEVTOOLS_OPTIONS = new InjectionToken<LocalizationDevtoolsServiceOptions>('Otter Localization Devtools options');
