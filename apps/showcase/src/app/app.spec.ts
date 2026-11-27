import {
  TestBed,
} from '@angular/core/testing';
import {
  provideEffects,
} from '@ngrx/effects';
import {
  provideStore,
} from '@ngrx/store';
import {
  provideApplicationDevtools,
} from '@o3r/application';
import {
  provideComponentsDevtools,
} from '@o3r/components';
import {
  provideConfigurationDevtools,
} from '@o3r/configuration';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  provideLocalizationDevtools,
} from '@o3r/transloco';
import {
  App,
} from './app';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      App
    ],
    providers: [
      provideStore(),
      provideEffects(),
      provideApplicationDevtools(),
      provideComponentsDevtools(),
      provideConfigurationDevtools(),
      provideLocalizationDevtools(),
      provideLocalizationMock(localizationConfiguration, mockTranslations)
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
