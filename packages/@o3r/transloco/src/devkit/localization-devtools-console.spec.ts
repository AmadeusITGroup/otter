import {
  TestBed,
} from '@angular/core/testing';
import {
  provideTransloco,
} from '@jsverse/transloco';
import {
  LocalizationService,
} from '../tools';
import {
  OtterLocalizationDevtools,
} from './localization-devtools';
import {
  LocalizationDevtoolsConsoleService,
} from './localization-devtools-console-service';
import {
  OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS,
} from './localization-devtools-token';

describe('Localization DevTools console', () => {
  let service: LocalizationDevtoolsConsoleService;

  beforeEach(async () => {
    jest.spyOn(console, 'info').mockImplementation();
    await TestBed.configureTestingModule({
      providers: [
        provideTransloco({
          config: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        }),
        LocalizationDevtoolsConsoleService,
        { provide: OtterLocalizationDevtools, useValue: {} },
        { provide: LocalizationService, useValue: { getCurrentLanguage: () => 'en' } },
        { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS }
      ]
    }).compileComponents();
    service = TestBed.inject(LocalizationDevtoolsConsoleService);
  });

  it('should be activated', () => {
    service.activate();

    expect((window as any)._OTTER_DEVTOOLS_?.[LocalizationDevtoolsConsoleService.windowModuleName]).toBeDefined();
  });
});
