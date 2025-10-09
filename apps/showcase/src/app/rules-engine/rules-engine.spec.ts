import {
  AsyncPipe,
} from '@angular/common';
import {
  Provider,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  StoreModule,
} from '@ngrx/store';
import {
  TranslateCompiler,
  TranslateFakeCompiler,
} from '@ngx-translate/core';
import {
  LocalizationService,
} from '@o3r/localization';
import {
  RulesEngineRunnerModule,
} from '@o3r/rules-engine';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  RulesEngine,
} from './rules-engine';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};

describe('RulesEngine', () => {
  let component: RulesEngine;
  let fixture: ComponentFixture<RulesEngine>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RulesEngine,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot(),
        RouterModule.forRoot([]),
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider),
        AsyncPipe
      ],
      providers: [provideMarkdown()]
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
    fixture = TestBed.createComponent(RulesEngine);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    await localizationService.configure();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
