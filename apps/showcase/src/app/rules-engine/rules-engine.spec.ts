import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideRouter,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  provideEffects,
} from '@ngrx/effects';
import {
  provideStore,
} from '@ngrx/store';
import {
  provideConfigurationRulesEngineAction,
} from '@o3r/configuration/rules-engine';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  provideAssetRulesEngineAction,
} from '@o3r/dynamic-content/rules-engine';
import {
  provideRulesEngineRunner,
} from '@o3r/rules-engine';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  LocalizationService,
} from '@o3r/transloco';
import {
  provideLocalizationRulesEngineAction,
} from '@o3r/transloco/rules-engine';
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

describe('RulesEngine', () => {
  let component: RulesEngine;
  let fixture: ComponentFixture<RulesEngine>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(async () => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [
        RulesEngine,
        AsyncPipe
      ],
      providers: [
        provideRouter([]),
        LocalizationService,
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideStore(),
        provideEffects(),
        provideRulesEngineRunner(),
        provideMarkdown(),
        provideDynamicContent(),
        provideConfigurationRulesEngineAction(),
        provideAssetRulesEngineAction(),
        provideLocalizationRulesEngineAction(),
        provideLocalizationMock(localizationConfiguration, mockTranslations)
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
