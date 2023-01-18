import { InjectionToken } from '@angular/core';
import { LocalizationDevtoolsServiceOptions } from './localization-devkit.interface';

export const OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS: LocalizationDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false
};

export const OTTER_LOCALIZATION_DEVTOOLS_OPTIONS: InjectionToken<LocalizationDevtoolsServiceOptions> = new InjectionToken<LocalizationDevtoolsServiceOptions>('Otter Localization Devtools options');
