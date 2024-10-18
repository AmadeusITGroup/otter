import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import {
  StoreModule
} from '@ngrx/store';
import {
  ConfigurationStoreModule
} from '../stores/index';
import {
  ConfigurationDevtoolsConsoleService
} from './configuration-devtools.console.service';
import type {
  ConfigurationDevtoolsServiceOptions
} from './configuration-devtools.interface';
import {
  ConfigurationDevtoolsMessageService
} from './configuration-devtools.message.service';
import {
  OtterConfigurationDevtools
} from './configuration-devtools.service';
import {
  OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_CONFIGURATION_DEVTOOLS_OPTIONS
} from './configuration-devtools.token';

@NgModule({
  imports: [
    StoreModule,
    ConfigurationStoreModule
  ],
  providers: [
    { provide: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, useValue: OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS },
    ConfigurationDevtoolsMessageService,
    ConfigurationDevtoolsConsoleService,
    OtterConfigurationDevtools
  ]
})
export class ConfigurationDevtoolsModule {
  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<ConfigurationDevtoolsServiceOptions>): ModuleWithProviders<ConfigurationDevtoolsModule> {
    return {
      ngModule: ConfigurationDevtoolsModule,
      providers: [
        { provide: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, useValue: { ...OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        ConfigurationDevtoolsMessageService,
        ConfigurationDevtoolsConsoleService,
        OtterConfigurationDevtools
      ]
    };
  }
}
