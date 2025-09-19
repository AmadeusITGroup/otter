import {
  Provider,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  StoreModule,
} from '@ngrx/store';
import {
  provideMockStore,
} from '@ngrx/store/testing';
import {
  TranslateCompiler,
  TranslateFakeCompiler,
} from '@ngx-translate/core';
import {
  ApplicationDevtoolsModule,
} from '@o3r/application';
import {
  ComponentsDevtoolsModule,
} from '@o3r/components';
import {
  ConfigurationDevtoolsModule,
} from '@o3r/configuration';
import {
  LocalizationDevtoolsModule,
} from '@o3r/localization';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  App,
} from './app';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ApplicationDevtoolsModule,
      ComponentsDevtoolsModule,
      StoreModule.forRoot(),
      ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider),
      ConfigurationDevtoolsModule,
      LocalizationDevtoolsModule,
      EffectsModule.forRoot()
    ],
    providers: [
      provideMockStore()
    ],
    declarations: [App]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
