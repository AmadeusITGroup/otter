import {
  AsyncPipe,
} from '@angular/common';
import {
  Provider,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
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
  provideMarkdown,
} from 'ngx-markdown';
import {
  Localization,
} from './localization';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
const mockTranslationsCompilerProvider: Provider = {
  provide: TranslateCompiler,
  useClass: TranslateFakeCompiler
};
describe('Localization', () => {
  let component: Localization;
  let fixture: ComponentFixture<Localization>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        Localization,
        ...mockTranslationModules(localizationConfiguration, mockTranslations, mockTranslationsCompilerProvider),
        AsyncPipe
      ],
      providers: [provideMarkdown()]
    });
    fixture = TestBed.createComponent(Localization);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    await localizationService.configure();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
