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
  AppComponent,
} from './app.component';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};

describe('AppComponent', () => {
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
    declarations: [AppComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
