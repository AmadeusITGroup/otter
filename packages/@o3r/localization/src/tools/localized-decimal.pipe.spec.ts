import { registerLocaleData } from '@angular/common';
import localeFR from '@angular/common/locales/fr';
import { ChangeDetectorRef } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TranslateModule } from '@ngx-translate/core';
import { createLocalizationConfiguration, LocalizationModule } from './localization.module';
import { LocalizationService } from './localization.service';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';
import { LocalizedDecimalPipe } from './localized-decimal.pipe';

/**
 * Fixture for ChangeDetectorRef
 */
class ChangeDetectorRefFixture implements Readonly<ChangeDetectorRef> {
  public markForCheck: jest.Mock<any, any>;
  public detach: jest.Mock<any, any>;
  public detectChanges: jest.Mock<any, any>;
  public checkNoChanges: jest.Mock<any, any>;
  public reattach: jest.Mock<any, any>;

  constructor() {
    this.markForCheck = jest.fn();
    this.detach = jest.fn();
    this.detectChanges = jest.fn();
    this.checkNoChanges = jest.fn();
    this.reattach = jest.fn();
  }
}

describe('LocalizedDecimalPipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let localizationService: LocalizationService;
  let pipe: LocalizedDecimalPipe;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
    registerLocaleData(localeFR, 'fr');
    TestBed.configureTestingModule({
      imports: [
        LocalizationModule.forRoot(() => ({language: 'fr'})),
        TranslateModule.forRoot()
      ],
      providers: [
        {provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture},
        {
          provide: LOCALIZATION_CONFIGURATION_TOKEN,
          useFactory: () => createLocalizationConfiguration({enableTranslationDeactivation: true, supportedLocales: ['en', 'fr'], fallbackLanguage: 'fr'})
        }
      ]
    });
    localizationService = TestBed.inject(LocalizationService);
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
    pipe = new LocalizedDecimalPipe(localizationService, changeDetectorRef);
  });

  it('should display the date using the current locale', () => {
    expect(pipe.transform(10000)).toBe('10 000');
    localizationService.useLanguage('en');

    expect(pipe.transform(10000)).toBe('10,000');
  });

  it('should mark for check when the language changes', () => {
    localizationService.useLanguage('en');

    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });
});
