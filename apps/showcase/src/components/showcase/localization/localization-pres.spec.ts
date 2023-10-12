import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalizationPresComponent } from './localization-pres.component';
import { Provider } from '@angular/core';
import { LocalizationService } from '@o3r/localization';
import { mockTranslationModules } from '@o3r/testing/localization';
import { TranslateCompiler } from '@ngx-translate/core';
import { TranslateFakeCompiler } from '@ngx-translate/core';
const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {
    /* eslint-disable @typescript-eslint/naming-convention */
    'o3r-localization-pres.departureLabel': 'Departure',
    'o3r-localization-pres.destinationLabel': 'Destination',
    'o3r-localization-pres.destinationPlaceholder': 'Please select a destination',
    'o3r-localization-pres.question': 'Where do you want to go?',
    'o3r-localization-pres.returnLabel': 'Return',
    'o3r-localization-pres.welcome': 'Welcome!',
    'o3r-localization-pres.welcomeWithCityName': 'Welcome to { cityName }!'
    /* eslint-enable @typescript-eslint/naming-convention */
  }
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
describe('LocalizationPresComponent', () => {
  let component: LocalizationPresComponent;
  let fixture: ComponentFixture<LocalizationPresComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LocalizationPresComponent,
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)
      ]
    });
    fixture = TestBed.createComponent(LocalizationPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    localizationService.configure();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
