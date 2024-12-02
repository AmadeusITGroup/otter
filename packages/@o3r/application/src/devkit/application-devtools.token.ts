import {
  InjectionToken,
} from '@angular/core';
import {
  ApplicationDevtoolsServiceOptions,
} from './application-devkit.interface';

export const OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS: ApplicationDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false
};

export const OTTER_APPLICATION_DEVTOOLS_OPTIONS: InjectionToken<ApplicationDevtoolsServiceOptions> = new InjectionToken<ApplicationDevtoolsServiceOptions>('Otter Application Devtools options');
