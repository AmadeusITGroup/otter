import {
  InjectionToken,
} from '@angular/core';
import {
  ComponentsDevtoolsServiceOptions,
} from './components-devkit.interface';

export const OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS: Readonly<ComponentsDevtoolsServiceOptions> = {
  isActivatedOnBootstrap: false
} as const;

export const OTTER_COMPONENTS_DEVTOOLS_OPTIONS = new InjectionToken<ComponentsDevtoolsServiceOptions>('Otter Components Devtools options');
