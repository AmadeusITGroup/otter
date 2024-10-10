import { ModuleWithProviders, NgModule, Pipe, PipeTransform, Provider } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LocalizationConfiguration, LocalizationModule, LocalizationTranslatePipe } from '@o3r/localization';
import { of } from 'rxjs';

const defaultLocalizationConfiguration = {
  supportedLocales: ['en'],
  language: 'en',
  endPointUrl: '',
  fallbackLanguage: 'en'
} as const satisfies Partial<LocalizationConfiguration>;

@Pipe({ name: 'translate' })
export class TranslatePipeMock implements PipeTransform {
  public transform(...args: any[]): string | undefined {
    return args && args.map((arg) => JSON.parse(arg)).join(', ');
  }
}

@Pipe({ name: 'o3rTranslate' })
export class O3rTranslatePipeMock implements PipeTransform {
  public transform(...args: any[]): string | undefined {
    return args && args.map((arg) => JSON.parse(arg)).join(', ');
  }
}

@NgModule({
  declarations: [TranslatePipeMock, O3rTranslatePipeMock],
  exports: [TranslatePipeMock, O3rTranslatePipeMock]
})
export class LocalizationDependencyMocks {
  public static forTest(pipeWithPrefix = false): ModuleWithProviders<LocalizationDependencyMocks> {
    return {
      ngModule: LocalizationDependencyMocks,
      providers: [{ provide: LocalizationTranslatePipe, useClass: pipeWithPrefix ? O3rTranslatePipeMock : TranslatePipeMock }]
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
 * @param localizationConfiguration Localization configuration
 * @param translations Translations to use
 * @param translationCompilerProvider Provider for translations compiler
 * @param mockPipe Enable translation pipe mocking
 * @param pipeWithPrefix Enable pipe with prefix
 * @returns List of modules to import in the TestBed
 */
export function mockTranslationModules(
  localizationConfiguration: Partial<LocalizationConfiguration> = defaultLocalizationConfiguration,
  translations: MockTranslations = {},
  translationCompilerProvider?: Provider,
  mockPipe = false,
  pipeWithPrefix = false
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
    ...(mockPipe ? [LocalizationDependencyMocks.forTest(pipeWithPrefix)] : [])
  ];
}
