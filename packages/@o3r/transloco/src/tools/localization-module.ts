import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
} from '@angular/common';
import {
  type EnvironmentProviders,
  InjectionToken,
  LOCALE_ID,
  makeEnvironmentProviders,
  Optional,
  type Provider,
} from '@angular/core';
import {
  DEFAULT_LOCALIZATION_CONFIGURATION,
  LocalizationConfiguration,
} from '../core';
import {
  LocalizationService,
} from './localization-service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
} from './localization-token';
import {
  LocalizedCurrencyPipe,
} from './localized-currency-pipe';
import {
  LocalizedDatePipe,
} from './localized-date-pipe';
import {
  LocalizedDecimalPipe,
} from './localized-decimal-pipe';
import {
  TextDirectionService,
} from './text-direction-service';

/**
 * creates LocalizationConfiguration, which is used if the application
 * @param configuration Localization configuration
 */
export function createLocalizationConfiguration(configuration?: Partial<LocalizationConfiguration>): LocalizationConfiguration {
  return {
    ...DEFAULT_LOCALIZATION_CONFIGURATION,
    ...configuration
  };
}

/**
 * Factory to inject the LOCALE_ID token with the current language into Angular context
 * @param localizationService Localization service
 */
export function localeIdNgBridge(localizationService: LocalizationService) {
  return localizationService.getCurrentLanguage();
}

/** Custom Localization Configuration Token to override default localization configuration */
export const CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN = new InjectionToken<Partial<LocalizationConfiguration>>('Partial Localization configuration');

/**
 * Provide localization services and configuration for the application.
 * This is the recommended way to set up localization in standalone applications.
 * @param configuration Optional partial localization configuration to override defaults. Can be a configuration object or a factory function.
 * @example Override of default and supported languages override at application bootstrap
 * ```typescript
 * bootstrapApplication(App, {
 *   providers: [
 *     provideLocalization({ language: 'en-US', supportedLocales: ['en-US', 'fr-FR'] })
 *   ]
 * });
 * ```
 */
export function provideLocalization(configuration?: Partial<LocalizationConfiguration> | (() => Partial<LocalizationConfiguration>)): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    LocalizationService,
    TextDirectionService,
    { provide: LOCALIZATION_CONFIGURATION_TOKEN, useFactory: createLocalizationConfiguration, deps: [[new Optional(), CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN]] },
    { provide: LOCALE_ID, useFactory: localeIdNgBridge, deps: [LocalizationService] },
    { provide: DatePipe, useClass: LocalizedDatePipe },
    { provide: DecimalPipe, useClass: LocalizedDecimalPipe },
    { provide: CurrencyPipe, useClass: LocalizedCurrencyPipe }
  ];

  if (configuration) {
    providers.push({
      provide: CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN,
      ...(typeof configuration === 'function' ? { useFactory: configuration } : { useValue: configuration })
    });
  }

  return makeEnvironmentProviders(providers);
}
