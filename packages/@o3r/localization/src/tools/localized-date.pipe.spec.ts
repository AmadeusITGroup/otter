import {
  registerLocaleData
} from '@angular/common';
import localeFR from '@angular/common/locales/fr';
import {
  ChangeDetectorRef
} from '@angular/core';
import {
  getTestBed,
  TestBed
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {
  TranslateModule
} from '@ngx-translate/core';
import {
  createLocalizationConfiguration,
  LocalizationModule
} from './localization.module';
import {
  LocalizationService
} from './localization.service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN
} from './localization.token';
import {
  LocalizedDatePipe
} from './localized-date.pipe';

describe('LocalizedDatePipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let localizationService: LocalizationService;
  let pipe: LocalizedDatePipe;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
    registerLocaleData(localeFR, 'fr');
    TestBed.configureTestingModule({
      imports: [
        LocalizationModule.forRoot(() => ({ language: 'fr' })),
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: LOCALIZATION_CONFIGURATION_TOKEN,
          useFactory: () => createLocalizationConfiguration({ enableTranslationDeactivation: true, supportedLocales: ['en', 'fr'], fallbackLanguage: 'fr' })
        }
      ]
    });
    localizationService = TestBed.inject(LocalizationService);
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
    pipe = new LocalizedDatePipe(localizationService, changeDetectorRef);
  });

  it('should display the date using the current locale', () => {
    expect(pipe.transform(new Date(2018, 11, 24), 'EEE, d MMM')).toBe('lun., 24 déc.');
    localizationService.useLanguage('en');

    expect(pipe.transform(new Date(2018, 11, 24), 'EEE, d MMM')).toBe('Mon, 24 Dec');
  });

  it('should mark for check when the language changes', () => {
    localizationService.useLanguage('en');
    const spy = jest.spyOn(changeDetectorRef, 'markForCheck');

    expect(spy).toHaveBeenCalled();
  });
});
