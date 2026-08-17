import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  LocalizationService,
} from '@o3r/transloco';
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
describe('LocalizationPres', () => {
  let component: LocalizationPres;
  let fixture: ComponentFixture<LocalizationPres>;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [LocalizationPres],
      providers: [provideLocalizationMock(localizationConfiguration, mockTranslations)]
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
