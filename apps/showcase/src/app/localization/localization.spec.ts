import { Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateCompiler, TranslateFakeCompiler } from '@ngx-translate/core';
import { LocalizationService } from '@o3r/localization';
import { mockTranslationModules } from '@o3r/testing/localization';
import { LocalizationComponent } from './localization.component';
const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
describe('LocalizationComponent', () => {
  let component: LocalizationComponent;
  let fixture: ComponentFixture<LocalizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        LocalizationComponent,
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider)
      ]
    });
    fixture = TestBed.createComponent(LocalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    localizationService.configure();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
