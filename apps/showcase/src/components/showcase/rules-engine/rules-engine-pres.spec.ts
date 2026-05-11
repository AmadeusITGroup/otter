import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
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
  RulesEnginePres,
} from './rules-engine-pres';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {

    'o3r-rules-engine-pres.departureLabel': 'Departure',
    'o3r-rules-engine-pres.destinationLabel': 'Destination',
    'o3r-rules-engine-pres.destinationPlaceholder': 'Please select a destination',
    'o3r-rules-engine-pres.question': 'Where do you want to go?',
    'o3r-rules-engine-pres.returnLabel': 'Return',
    'o3r-rules-engine-pres.welcome': 'Welcome!',
    'o3r-rules-engine-pres.welcomeWithCityName': 'Welcome to { cityName }!'

  }
};
describe('RulesEnginePres', () => {
  let component: RulesEnginePres;
  let fixture: ComponentFixture<RulesEnginePres>;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RulesEnginePres,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        RulesEngineRunnerModule.forRoot(),
        AsyncPipe
      ],
      providers: [
        LocalizationService,
        provideDynamicContent(),
        provideLocalizationMock(localizationConfiguration, mockTranslations)
      ]
    });
    fixture = TestBed.createComponent(RulesEnginePres);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    await localizationService.configure();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
