import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { ConfigurationDevtoolsModule } from '@o3r/configuration';
import { LocalizationDevtoolsModule } from '@o3r/localization';
import { mockTranslationModules } from '@o3r/testing/localization';
import { TranslateCompiler } from '@ngx-translate/core';
import { TranslateFakeCompiler } from '@ngx-translate/core';
import { AppComponent } from './app.component';

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
    declarations: [AppComponent],
    imports: [
      StoreModule.forRoot(),
      ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider),
      ConfigurationDevtoolsModule,
      LocalizationDevtoolsModule
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
