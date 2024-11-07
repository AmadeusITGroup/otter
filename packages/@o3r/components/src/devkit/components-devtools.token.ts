import {
  InjectionToken,
} from '@angular/core';
import {
  ComponentsDevtoolsServiceOptions,
} from './components-devkit.interface';

export const OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS: ComponentsDevtoolsServiceOptions = {
  isActivatedOnBootstrap: false
};

export const OTTER_COMPONENTS_DEVTOOLS_OPTIONS: InjectionToken<ComponentsDevtoolsServiceOptions> = new InjectionToken<ComponentsDevtoolsServiceOptions>('Otter Components Devtools options');
