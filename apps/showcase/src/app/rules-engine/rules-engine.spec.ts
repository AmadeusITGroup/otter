import { Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateCompiler, TranslateFakeCompiler } from '@ngx-translate/core';
import { LocalizationService } from '@o3r/localization';
import { RulesEngineModule } from '@o3r/rules-engine';
import { mockTranslationModules } from '@o3r/testing/localization';
import { RulesEngineComponent } from './rules-engine.component';
import { RouterModule } from '@angular/router';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};

describe('RulesEngineComponent', () => {
  let component: RulesEngineComponent;
  let fixture: ComponentFixture<RulesEngineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RulesEngineComponent,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineModule.forRoot(),
        RouterModule.forRoot([]),
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)
      ]
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          rulesets: [{
            rules: [
              {},
              {},
              {}
            ]
          }]
        })
      })
    ) as jest.Mock;
    fixture = TestBed.createComponent(RulesEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    localizationService.configure();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
