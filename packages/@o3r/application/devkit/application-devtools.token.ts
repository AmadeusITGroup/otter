import {
  InjectionToken,
} from '@angular/core';
import {
  ApplicationDevtoolsServiceOptions,
} from './application-devkit.interface';

export const OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS: Readonly<ApplicationDevtoolsServiceOptions> = {
  isActivatedOnBootstrap: false
} as const;

export const OTTER_APPLICATION_DEVTOOLS_OPTIONS = new InjectionToken<ApplicationDevtoolsServiceOptions>('Otter Application Devtools options');
