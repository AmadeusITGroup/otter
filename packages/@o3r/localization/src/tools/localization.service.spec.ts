import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_LOCALIZATION_CONFIGURATION, LocalizationConfiguration } from '../core';
import { LocalizationModule } from './localization.module';
import { LocalizationService } from './localization.service';

describe('LocalizationService', () => {

  describe('default configuration', () => {

    const configurationFactory: () => LocalizationConfiguration = () => ({
      ...DEFAULT_LOCALIZATION_CONFIGURATION
    });

    let localizationService: LocalizationService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          LocalizationModule.forRoot(configurationFactory),
          TranslateModule.forRoot()
        ],
        providers: [LocalizationService]
      }).compileComponents();
      localizationService = TestBed.inject(LocalizationService);

      localizationService.configure();
    });

    it('should be used for transulations (en)', () => {
      const expectedLanguage = 'en';

      expect(localizationService.getCurrentLanguage()).toEqual(expectedLanguage);
    });

  });

  describe('fallbackLocalesMap configuration unavailable', () => {

    const configurationFactory: () => LocalizationConfiguration = () => ({
      ...DEFAULT_LOCALIZATION_CONFIGURATION,
      supportedLocales: ['en-GB', 'fr-FR', 'fr-CA', 'ar-AR'],
      fallbackLanguage: 'en-GB'
    });

    let localizationService: LocalizationService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          LocalizationModule.forRoot(configurationFactory),
          TranslateModule.forRoot()
        ],
        providers: [LocalizationService]
      }).compileComponents();
      localizationService = TestBed.inject(LocalizationService);

      localizationService.configure();
    });

    it('should translate to the same language, when supported language provided', () => {

      localizationService.useLanguage('en-GB');

      expect(localizationService.getCurrentLanguage()).toEqual('en-GB');

      localizationService.useLanguage('ar-AR');

      expect(localizationService.getCurrentLanguage()).toEqual('ar-AR');

      localizationService.useLanguage('fr-CA');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-CA');

      localizationService.useLanguage('fr-FR');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

    });

    it('should translate to the nearest supported language, when un-supported language provided', () => {

      localizationService.useLanguage('fr-BE');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

      localizationService.useLanguage('ar-EG');

      expect(localizationService.getCurrentLanguage()).toEqual('ar-AR');

    });

    it(`should translate to the default fallback language, when un-supported language provided and
        no nearest supportedLocales language available`, () => {
      const actualLanguage = 'de-AT';
      const expectedLanguage = 'en-GB';

      localizationService.useLanguage(actualLanguage);

      expect(localizationService.getCurrentLanguage()).toEqual(expectedLanguage);
    });

  });

  describe('fallbackLocalesMap configuration available', () => {

    const configurationFactory: () => LocalizationConfiguration = () => ({
      ...DEFAULT_LOCALIZATION_CONFIGURATION,
      supportedLocales: ['en-GB', 'en-US', 'fr-FR', 'ar-AR'],
      /* eslint-disable @typescript-eslint/naming-convention */
      fallbackLocalesMap: {
        'en-CA': 'en-US',
        'fr-CA': 'fr-FR',
        'de-CH': 'ar-AR',
        de: 'fr-FR',
        it: 'fr-FR',
        hi: 'en-GB',
        zh: 'en-GB'
      },
      /* eslint-enable @typescript-eslint/naming-convention */
      fallbackLanguage: 'fr-FR'
    });

    let localizationService: LocalizationService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          LocalizationModule.forRoot(configurationFactory),
          TranslateModule.forRoot()
        ],
        providers: [LocalizationService]
      }).compileComponents();
      localizationService = TestBed.inject(LocalizationService);

      localizationService.configure();
    });

    it('should translate to the same language, when supported language provided', () => {

      localizationService.useLanguage('en-GB');

      expect(localizationService.getCurrentLanguage()).toEqual('en-GB');

      localizationService.useLanguage('ar-AR');

      expect(localizationService.getCurrentLanguage()).toEqual('ar-AR');

    });

    it('should translate to the fallback locale map language, when un-supported language provided', () => {

      localizationService.useLanguage('en-CA');

      expect(localizationService.getCurrentLanguage()).toEqual('en-US');

      localizationService.useLanguage('fr-CA');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

      localizationService.useLanguage('de-CH');

      expect(localizationService.getCurrentLanguage()).toEqual('ar-AR');

      localizationService.useLanguage('de-DE');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

      localizationService.useLanguage('de-AT');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

      localizationService.useLanguage('it-IT');

      expect(localizationService.getCurrentLanguage()).toEqual('fr-FR');

      localizationService.useLanguage('zh-TW');

      expect(localizationService.getCurrentLanguage()).toEqual('en-GB');

      localizationService.useLanguage('zh-CN');

      expect(localizationService.getCurrentLanguage()).toEqual('en-GB');

    });

    it(`should translate to the nearest supported language, when un-supported language provided,
        fallback locale map doen't have the mapped language`, () => {
      const actualLanguage = 'en-AU';
      const expectedLanguage = 'en-GB';

      localizationService.useLanguage(actualLanguage);

      expect(localizationService.getCurrentLanguage()).toEqual(expectedLanguage);
    });

    it(`should fallback to the default language, when un-supported language provided,
        no nearest supportedLocales, fallbackLocalesMap language available`, () => {
      const actualLanguage = 'bn-BD';
      const expectedLanguage = 'fr-FR';

      localizationService.useLanguage(actualLanguage);

      expect(localizationService.getCurrentLanguage()).toEqual(expectedLanguage);
    });

  });

});
