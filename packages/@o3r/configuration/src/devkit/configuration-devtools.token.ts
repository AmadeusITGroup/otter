import {
  InjectionToken
} from '@angular/core';
import {
  ConfigurationDevtoolsServiceOptions
} from './configuration-devtools.interface';

export const OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS: ConfigurationDevtoolsServiceOptions = {
  defaultLibraryName: '@o3r/components',
  defaultJsonFilename: 'partial-static-config.json',
  isActivatedOnBootstrap: false,
  isActivatedOnBootstrapWhenCMSContext: true
};

export const OTTER_CONFIGURATION_DEVTOOLS_OPTIONS = new InjectionToken<ConfigurationDevtoolsServiceOptions>('Otter Configuration Devtools options');
