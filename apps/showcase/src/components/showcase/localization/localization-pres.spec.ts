import {
  Provider,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  TranslateCompiler,
  TranslateFakeCompiler,
} from '@ngx-translate/core';
import {
  LocalizationService,
} from '@o3r/localization';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  LocalizationPres,
} from './localization-pres';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {

    'o3r-localization-pres.departureLabel': 'Departure',
    'o3r-localization-pres.destinationLabel': 'Destination',
    'o3r-localization-pres.destinationPlaceholder': 'Please select a destination',
    'o3r-localization-pres.question': 'Where do you want to go?',
    'o3r-localization-pres.returnLabel': 'Return',
    'o3r-localization-pres.welcome': 'Welcome!',
    'o3r-localization-pres.welcomeWithCityName': 'Welcome to { cityName }!'

  }
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
describe('LocalizationPres', () => {
  let component: LocalizationPres;
  let fixture: ComponentFixture<LocalizationPres>;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        LocalizationPres,
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)
      ]
    });
    fixture = TestBed.createComponent(LocalizationPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    await localizationService.configure();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
