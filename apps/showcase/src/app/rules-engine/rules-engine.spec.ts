import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  StoreModule,
} from '@ngrx/store';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  RulesEngineRunnerModule,
} from '@o3r/rules-engine';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  LocalizationService,
} from '@o3r/transloco';
import {
  LocalizationRulesEngineActionHandler,
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
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot(),
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        LocalizationService,
        LocalizationRulesEngineActionHandler,
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown(),
        provideDynamicContent(),
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
