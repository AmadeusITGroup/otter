import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import type {
  ApplicationDevtoolsServiceOptions
} from './application-devkit.interface';
import {
  ApplicationDevtoolsConsoleService
} from './application-devtools.console.service';
import {
  ApplicationDevtoolsMessageService
} from './application-devtools.message.service';
import {
  OtterApplicationDevtools
} from './application-devtools.service';
import {
  OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_APPLICATION_DEVTOOLS_OPTIONS
} from './application-devtools.token';

@NgModule({
  providers: [
    { provide: OTTER_APPLICATION_DEVTOOLS_OPTIONS, useValue: OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS },
    ApplicationDevtoolsMessageService,
    ApplicationDevtoolsConsoleService,
    OtterApplicationDevtools
  ]
})
export class ApplicationDevtoolsModule {
  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<ApplicationDevtoolsServiceOptions>): ModuleWithProviders<ApplicationDevtoolsModule> {
    return {
      ngModule: ApplicationDevtoolsModule,
      providers: [
        { provide: OTTER_APPLICATION_DEVTOOLS_OPTIONS, useValue: { ...OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        ApplicationDevtoolsMessageService,
        ApplicationDevtoolsConsoleService,
        OtterApplicationDevtools
      ]
    };
  }
}
