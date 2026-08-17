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
  ApplicationDevtoolsModule,
} from '@o3r/application';
import {
  ComponentsDevtoolsModule,
} from '@o3r/components';
import {
  ConfigurationDevtoolsModule,
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
      ApplicationDevtoolsModule,
      ComponentsDevtoolsModule,
      StoreModule.forRoot(),
      ConfigurationDevtoolsModule,
      EffectsModule.forRoot()
    ],
    providers: [
      provideMockStore(),
      provideLocalizationDevtools(),
      provideLocalizationMock(localizationConfiguration, mockTranslations)
    ],
    declarations: [App]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
