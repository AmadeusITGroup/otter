import { Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateCompiler, TranslateFakeCompiler } from '@ngx-translate/core';
import { LocalizationService } from '@o3r/localization';
import { RulesEngineModule } from '@o3r/rules-engine';
import { mockTranslationModules } from '@o3r/testing/localization';
import { RulesEnginePresComponent } from './rules-engine-pres.component';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {
    /* eslint-disable @typescript-eslint/naming-convention */
    'o3r-rules-engine-pres.departureLabel': 'Departure',
    'o3r-rules-engine-pres.destinationLabel': 'Destination',
    'o3r-rules-engine-pres.destinationPlaceholder': 'Please select a destination',
    'o3r-rules-engine-pres.question': 'Where do you want to go?',
    'o3r-rules-engine-pres.returnLabel': 'Return',
    'o3r-rules-engine-pres.welcome': 'Welcome!',
    'o3r-rules-engine-pres.welcomeWithCityName': 'Welcome to { cityName }!'
    /* eslint-enable @typescript-eslint/naming-convention */
  }
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
describe('RulesEnginePresComponent', () => {
  let component: RulesEnginePresComponent;
  let fixture: ComponentFixture<RulesEnginePresComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RulesEnginePresComponent,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        RulesEngineModule.forRoot(),
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)
      ]
    });
    fixture = TestBed.createComponent(RulesEnginePresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    localizationService.configure();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
