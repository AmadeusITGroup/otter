import { FactoryProvider, Optional } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { DynamicContentService } from '@o3r/dynamic-content';
import { LoggerService } from '@o3r/logger';
import { LocalizationConfiguration } from '../core';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';
import { TranslationsLoader } from './translations-loader';

/**
 * Creates a loader of translations bundles based on the configuration
 * (endPointUrl and language determine which bundle we load and where do we fetch it from)
 * @param localizationConfiguration
 * @param logger service to handle the log of warning and errors
 * @param dynamicContentService (optional)
 */
export function createTranslateLoader(localizationConfiguration: LocalizationConfiguration, logger?: LoggerService, dynamicContentService?: DynamicContentService) {
  return new TranslationsLoader(localizationConfiguration, logger, dynamicContentService);
}

/**
 * TranslateLoader provider, using framework's TranslationsLoader class
 */
export const translateLoaderProvider: FactoryProvider = {
  provide: TranslateLoader,
  useFactory: createTranslateLoader,
  deps: [LOCALIZATION_CONFIGURATION_TOKEN, [new Optional(), LoggerService], [new Optional(), DynamicContentService]]
};
