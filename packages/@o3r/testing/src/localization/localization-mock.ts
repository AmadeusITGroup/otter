import { ModuleWithProviders, NgModule, Pipe, PipeTransform, Provider } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LocalizationConfiguration, LocalizationModule, LocalizationTranslatePipe } from '@o3r/localization';
import { of } from 'rxjs';

const defaultLocalizationConfiguration: Partial<LocalizationConfiguration> = {
  supportedLocales: ['en'],
  language: 'en',
  endPointUrl: '',
  fallbackLanguage: 'en'
};

@Pipe({ name: 'translate' })
export class TranslatePipeMock implements PipeTransform {
  public transform(...args: any[]): string | undefined {
    return args && args.map((arg) => JSON.parse(arg)).join(', ');
  }
}

@NgModule({
  declarations: [TranslatePipeMock],
  exports: [TranslatePipeMock]
})
export class LocalizationDependencyMocks {
  public static forTest(): ModuleWithProviders<LocalizationDependencyMocks> {
    return {
      ngModule: LocalizationDependencyMocks,
      providers: [{ provide: LocalizationTranslatePipe, useClass: TranslatePipeMock }]
    };
  }
}

/** Mock to provide to the MockTranslation module */
export interface MockTranslations {
  [lang: string]: {
    [key: string]: any;
  };
}

/**
 * Function to get the list of modules required to test component using Localization module
 *
 * @param localizationConfiguration Localization configuration
 * @param translations              Translations to use
 * @param translationCompilerProvider
 * @param mockPipe                  Enable Translation pipe mocking
 * @returns                           List of modules to import in your TestBed
 */
export function mockTranslationModules(
  localizationConfiguration: Partial<LocalizationConfiguration> = defaultLocalizationConfiguration,
  translations: MockTranslations = {},
  translationCompilerProvider?: Provider,
  mockPipe = false
): ModuleWithProviders<LocalizationModule>[] {
  return [
    LocalizationModule.forRoot(() => localizationConfiguration),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useValue: {
          getTranslation: (lang: string) => of(translations[lang])
        }
      },
      compiler: translationCompilerProvider
    }),
    ...(mockPipe ? [LocalizationDependencyMocks.forTest()] : [])
  ];
}
