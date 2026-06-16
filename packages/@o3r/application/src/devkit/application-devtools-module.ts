import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import type {
  ApplicationDevtoolsServiceOptions,
} from './application-devkit-interface';
import {
  OtterApplicationDevtools,
} from './application-devtools';
import {
  ApplicationDevtoolsConsoleService,
} from './application-devtools-console-service';
import {
  ApplicationDevtoolsMessageService,
} from './application-devtools-message-service';
import {
  OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_APPLICATION_DEVTOOLS_OPTIONS,
} from './application-devtools-token';

/**
 * @deprecated Will be removed in v16. Use {@link provideApplicationDevtools} instead.
 */
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

/**
 * Provide application devtools functionality.
 * @param options Application devtools options
 */
export function provideApplicationDevtools(options?: Partial<ApplicationDevtoolsServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: OTTER_APPLICATION_DEVTOOLS_OPTIONS, useValue: { ...OTTER_APPLICATION_DEVTOOLS_DEFAULT_OPTIONS, ...options } },
    ApplicationDevtoolsMessageService,
    ApplicationDevtoolsConsoleService,
    OtterApplicationDevtools
  ]);
}
