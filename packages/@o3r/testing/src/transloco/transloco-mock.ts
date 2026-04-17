import {
  EnvironmentProviders,
  Pipe,
  PipeTransform,
  Provider,
} from '@angular/core';
import {
  provideTransloco,
  TRANSLOCO_LOADER,
} from '@jsverse/transloco';
import {
  LocalizationConfiguration,
  provideLocalization,
} from '@o3r/transloco';
import {
  of,
} from 'rxjs';

/**
 * Default localization configuration for testing
 */
const defaultLocalizationConfiguration = {
  supportedLocales: ['en'],
  language: 'en',
  fallbackLanguage: 'en'
} as const satisfies Partial<LocalizationConfiguration>;

/**
 * Mock translations interface to provide to the mock localization provider
 */
export interface MockTranslations {
  [lang: string]: {
    [key: string]: any;
  };
}

/**
 * Mock pipe for transloco (from \@jsverse/transloco)
 */
@Pipe({
  name: 'transloco',
  standalone: true
})
export class TranslocoPipeMock implements PipeTransform {
  /**
   * Transform method for the mock pipe
   * @param args Arguments passed to the pipe
   */
  public transform(...args: any[]): string | undefined {
    return args && args.map((arg) => JSON.stringify(arg)).join(', ');
  }
}

/**
 * Mock pipe for o3rTranslate
 */
@Pipe({
  name: 'o3rTranslate',
  standalone: true
})
export class O3rTranslatePipeMock implements PipeTransform {
  /**
   * Transform method for the mock pipe
   * @param args Arguments passed to the pipe
   */
  public transform(...args: any[]): string | undefined {
    return args && args.map((arg) => JSON.stringify(arg)).join(', ');
  }
}

/**
 * Provides mock localization configuration for testing
 * @param localizationConfiguration Localization configuration
 * @param translations Translations to use
 * @returns List of providers for the TestBed
 */
export function provideLocalizationMock(
  localizationConfiguration: Partial<LocalizationConfiguration> = defaultLocalizationConfiguration,
  translations: MockTranslations = {}
): (Provider | EnvironmentProviders)[] {
  const providers: Provider[] = [
    { provide: TRANSLOCO_LOADER, useValue: { getTranslation: (lang: string) => of(translations[lang]) } }
  ];

  return [
    ...provideTransloco({
      config: {
        availableLangs: localizationConfiguration.supportedLocales || ['en'],
        defaultLang: localizationConfiguration.language || localizationConfiguration.fallbackLanguage || 'en',
        reRenderOnLangChange: true,
        prodMode: true
      }
    }),
    ...providers,
    provideLocalization(localizationConfiguration)
  ];
}
