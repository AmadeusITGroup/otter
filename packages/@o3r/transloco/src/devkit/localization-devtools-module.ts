import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import type {
  LocalizationDevtoolsServiceOptions,
} from './localization-devkit-interface';
import {
  OtterLocalizationDevtools,
} from './localization-devtools';
import {
  LocalizationDevtoolsConsoleService,
} from './localization-devtools-console-service';
import {
  LocalizationDevtoolsMessageService,
} from './localization-devtools-message-service';
import {
  OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS,
} from './localization-devtools-token';

/**
 * Provide localization devtools functionality for the application.
 * This is the recommended way to set up localization devtools in standalone applications.
 * @param options Optional partial localization devtools configuration to override defaults. Can be a configuration object or a factory function.
 * @example Load localization with automatic activation at bootstrap
 * ```typescript
 * bootstrapApplication(App, {
 *   providers: [
 *     provideLocalizationDevtools({ isActivatedOnBootstrap: true })
 *   ]
 * });
 * ```
 */
export function provideLocalizationDevtools(options?: Partial<LocalizationDevtoolsServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS,
      useValue: { ...OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, ...options }
    },
    LocalizationDevtoolsMessageService,
    LocalizationDevtoolsConsoleService,
    OtterLocalizationDevtools
  ]);
}
