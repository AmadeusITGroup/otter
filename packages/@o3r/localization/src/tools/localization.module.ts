import { BidiModule, Directionality } from '@angular/cdk/bidi';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { InjectionToken, LOCALE_ID, ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicContentModule } from '@o3r/dynamic-content';
import { DEFAULT_LOCALIZATION_CONFIGURATION, LocalizationConfiguration } from '../core';
import { LocalizationTranslateDirective } from './localization-translate.directive';
import { LocalizationTranslatePipe, O3rLocalizationTranslatePipe } from './localization-translate.pipe';
import { LocalizationService } from './localization.service';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';
import { LocalizedCurrencyPipe } from './localized-currency.pipe';
import { LocalizedDatePipe } from './localized-date.pipe';
import { LocalizedDecimalPipe } from './localized-decimal.pipe';
import { TextDirectionService } from './text-direction.service';
import { TextDirectionality } from './text-directionality.service';

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

@NgModule({
  declarations: [O3rLocalizationTranslatePipe, LocalizationTranslatePipe, LocalizationTranslateDirective, LocalizedDatePipe, LocalizedDecimalPipe, LocalizedCurrencyPipe],
  imports: [TranslateModule, BidiModule, DynamicContentModule, CommonModule],
  exports: [TranslateModule, O3rLocalizationTranslatePipe, LocalizationTranslatePipe, LocalizationTranslateDirective, LocalizedDatePipe, LocalizedDecimalPipe, LocalizedCurrencyPipe],
  providers: [
    {provide: LOCALIZATION_CONFIGURATION_TOKEN, useFactory: createLocalizationConfiguration, deps: [[new Optional(), CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN]]},
    {provide: LOCALE_ID, useFactory: localeIdNgBridge, deps: [LocalizationService]},
    {provide: Directionality, useClass: TextDirectionality},
    {provide: DatePipe, useClass: LocalizedDatePipe},
    {provide: DecimalPipe, useClass: LocalizedDecimalPipe},
    {provide: CurrencyPipe, useClass: LocalizedCurrencyPipe},
    TextDirectionService
  ]
})
export class LocalizationModule {
  /**
   * forRoot method should be called only once from the application index.ts
   * It will do several things:
   * - provide the configuration for the whole application
   * - register all locales specified in the LocalizationConfiguration
   * - configure TranslateService
   * - inject LOCALE_ID token
   * @param configuration LocalizationConfiguration
   */
  public static forRoot(
    configuration?: () => Partial<LocalizationConfiguration>
  ): ModuleWithProviders<LocalizationModule> {
    return {
      ngModule: LocalizationModule,
      providers: [
        LocalizationService,
        ...(configuration
          ? [{
            provide: CUSTOM_LOCALIZATION_CONFIGURATION_TOKEN,
            useFactory: configuration
          }]
          : [])
      ]
    };
  }
}
