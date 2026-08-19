import {
  ChangeDetectorRef,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  provideTransloco,
  Translation,
  TRANSLOCO_LOADER,
  TranslocoLoader,
  TranslocoService,
} from '@jsverse/transloco';
import {
  firstValueFrom,
  Observable,
  of,
} from 'rxjs';
import {
  ChangeDetectorRefFixture,
} from '../../testing/change-detector-ref-fixture';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
  LocalizationService,
  O3rLocalizationTranslatePipe,
  provideLocalization,
} from '@o3r/transloco';

const translations: Record<string, Translation> = {
  en: {
    test: 'This is a test',
    testParams: 'This is a test {{param1}} {{param2}}'
  }
};

class FakeLoader implements TranslocoLoader {
  public getTranslation(lang: string): Observable<Translation> {
    return of(translations[lang] || {});
  }
}

describe('LocalizationTranslatePipe', () => {
  let localizationService: LocalizationService;
  let pipe: O3rLocalizationTranslatePipe;

  describe('enableTranslationDeactivation OFF', () => {
    it('should throw when trying to deactivate the translation', async () => {
      await TestBed.configureTestingModule({
        providers: [
          provideTransloco({ config: {} }),
          provideLocalization({ language: 'en', supportedLocales: ['en'] }),
          { provide: TRANSLOCO_LOADER, useClass: FakeLoader },
          { provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture },
          { provide: O3rLocalizationTranslatePipe, deps: [LocalizationService, TranslocoService, ChangeDetectorRef, LOCALIZATION_CONFIGURATION_TOKEN] }
        ]
      }).compileComponents();

      localizationService = TestBed.inject(LocalizationService);
      // initialize TranslocoService via configure of LocalizationService
      await localizationService.configure();
      pipe = TestBed.inject(O3rLocalizationTranslatePipe);

      expect(() => localizationService.toggleShowKeys()).toThrow();
    });
  });

  describe('enableTranslationDeactivation ON', () => {
    describe('debug mode OFF', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          providers: [
            provideTransloco({ config: { defaultLang: 'en', prodMode: true } }),
            provideLocalization({ supportedLocales: ['en'], enableTranslationDeactivation: true }),
            { provide: TRANSLOCO_LOADER, useClass: FakeLoader },
            { provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture },
            { provide: O3rLocalizationTranslatePipe, deps: [LocalizationService, TranslocoService, ChangeDetectorRef, LOCALIZATION_CONFIGURATION_TOKEN] }
          ]
        }).compileComponents();

        localizationService = TestBed.inject(LocalizationService);
        // initialize TranslocoService via configure of LocalizationService
        await localizationService.configure();
        // Load translations via loader so they are cached for _loadDependencies
        const translateService = TestBed.inject(TranslocoService);
        await firstValueFrom(translateService.load('en'));
        pipe = TestBed.inject(O3rLocalizationTranslatePipe);
      });

      it('Should not translate if ShowKeys is activated', () => {
        localizationService.toggleShowKeys();

        expect(pipe.transform('test')).toEqual('test');
        expect(pipe.transform('testParams', { param1: 'with param-1', param2: 'and param-2' })).toEqual('testParams');
      });

      it('Should translate if ShowKeys is not activated', () => {
        expect(pipe.transform('test')).toEqual('This is a test');

        expect(pipe.transform('testParams', { param1: 'with param-1', param2: 'and param-2' })).toEqual('This is a test with param-1 and param-2');
      });
    });

    describe('debug mode ON', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          providers: [
            provideTransloco({ config: { defaultLang: 'en', prodMode: true } }),
            provideLocalization({ supportedLocales: ['en'], debugMode: true, enableTranslationDeactivation: true }),
            { provide: TRANSLOCO_LOADER, useClass: FakeLoader },
            { provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture },
            { provide: O3rLocalizationTranslatePipe, deps: [LocalizationService, TranslocoService, ChangeDetectorRef, LOCALIZATION_CONFIGURATION_TOKEN] }
          ]
        }).compileComponents();
        localizationService = TestBed.inject(LocalizationService);
        // initialize TranslocoService via configure of LocalizationService
        await localizationService.configure();
        // Load translations via loader so they are cached for _loadDependencies
        const translateService = TestBed.inject(TranslocoService);
        await firstValueFrom(translateService.load('en'));
        pipe = TestBed.inject(O3rLocalizationTranslatePipe);
      });

      it('Should not translate if ShowKeys is activated', () => {
        localizationService.toggleShowKeys();

        expect(pipe.transform('test')).toEqual('test');
        expect(pipe.transform('testParams', { param1: 'with param-1', param2: 'and param-2' })).toEqual('testParams');
      });

      it('Should display both key and value if ShowKeys is not activated', () => {
        expect(pipe.transform('test')).toEqual('test - This is a test');

        expect(pipe.transform('testParams', { param1: 'with param-1', param2: 'and param-2' })).toEqual('testParams - This is a test with param-1 and param-2');
      });
    });
  });
});
