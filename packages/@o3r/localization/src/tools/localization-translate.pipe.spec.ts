import { ChangeDetectorRef } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LocalizationTranslatePipe } from './localization-translate.pipe';
import { createLocalizationConfiguration, LocalizationModule } from './localization.module';
import { LocalizationService } from './localization.service';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';

const translations: any = {
  en: {
    test: 'This is a test',
    testParams: 'This is a test {{param1}} {{param2}}'
  }
};

class FakeLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return of(translations[lang]);
  }
}

class FakeChangeDetectorRef extends ChangeDetectorRef {
  public markForCheck(): void {}
  public detach(): void {}
  public detectChanges(): void {}
  public checkNoChanges(): void {}
  public reattach(): void {}
}

describe('LocalizationTranslatePipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let localizationService: LocalizationService;
  let translate: TranslateService;
  let pipe: LocalizationTranslatePipe;
  let ref: any;

  describe('enableTranslationDeactivation OFF', () => {
    it('should throw when trying to deactivate the translation', async () => {
      await TestBed.configureTestingModule({
        imports: [
          LocalizationModule.forRoot(() => ({language: 'en'})),
          TranslateModule.forRoot({
            loader: {provide: TranslateLoader, useClass: FakeLoader}
          })
        ],
        providers: [LocalizationService]
      }).compileComponents();

      localizationService = TestBed.get(LocalizationService);
      // initialize TranslateService via configure of LocalizationService
      localizationService.configure();
      translate = TestBed.get(TranslateService);
      ref = new FakeChangeDetectorRef();
      pipe = new LocalizationTranslatePipe(localizationService, translate, ref, TestBed.get(LOCALIZATION_CONFIGURATION_TOKEN));

      expect(() => localizationService.toggleShowKeys()).toThrow();
    });
  });

  describe('enableTranslationDeactivation ON', () => {
    describe('debug mode OFF', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [
            LocalizationModule.forRoot(() => ({language: 'en'})),
            TranslateModule.forRoot({
              loader: {provide: TranslateLoader, useClass: FakeLoader}
            })
          ],
          providers: [
            LocalizationService,
            {
              provide: LOCALIZATION_CONFIGURATION_TOKEN,
              useFactory: () => createLocalizationConfiguration({enableTranslationDeactivation: true})
            }]
        }).compileComponents();

        localizationService = TestBed.get(LocalizationService);
        // initialize TranslateService via configure of LocalizationService
        localizationService.configure();
        translate = TestBed.get(TranslateService);
        ref = new FakeChangeDetectorRef();
        pipe = new LocalizationTranslatePipe(localizationService, translate, ref, TestBed.get(LOCALIZATION_CONFIGURATION_TOKEN));
      });

      it('Should not translate if ShowKeys is activated', () => {
        localizationService.toggleShowKeys();

        expect(pipe.transform('test')).toEqual('test');
        expect(pipe.transform('testParams', '{param1: "with param-1", param2: "and param-2"}')).toEqual('testParams');
      });

      it('Should translate if ShowKeys is no activated', () => {
        expect(pipe.transform('test')).toEqual('This is a test');

        expect(pipe.transform('testParams', '{param1: "with param-1", param2: "and param-2"}')).toEqual('This is a test with param-1 and param-2');
      });
    });

    describe('debug mode ON', () => {
      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [
            LocalizationModule.forRoot(() => ({language: 'en'})),
            TranslateModule.forRoot({
              loader: {
                provide: TranslateLoader,
                useClass: FakeLoader
              }
            })
          ],
          providers: [
            LocalizationService,
            {
              provide: LOCALIZATION_CONFIGURATION_TOKEN,
              useFactory: () => createLocalizationConfiguration({debugMode: true, enableTranslationDeactivation: true})
            }
          ]
        }).compileComponents();
        localizationService = TestBed.get(LocalizationService);
        // initialize TranslateService via configure of LocalizationService
        localizationService.configure();
        translate = TestBed.get(TranslateService);
        ref = new FakeChangeDetectorRef();
        pipe = new LocalizationTranslatePipe(localizationService, translate, ref, TestBed.get(LOCALIZATION_CONFIGURATION_TOKEN));
      });

      it('Should not translate if ShowKeys is activated', () => {
        localizationService.toggleShowKeys();

        expect(pipe.transform('test')).toEqual('test');
        expect(pipe.transform('testParams', '{param1: "with param-1", param2: "and param-2"}')).toEqual('testParams');
      });

      it('Should display both key and value if ShowKeys is no activated', () => {
        expect(pipe.transform('test')).toEqual('test - This is a test');

        expect(pipe.transform('testParams', '{param1: "with param-1", param2: "and param-2"}')).toEqual('testParams - This is a test with param-1 and param-2');
      });
    });
  });

});
