
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { LocalizationModule, LocalizationService } from '../tools/index';
import { LocalizationDevtoolsConsoleService } from './localization-devtools.console.service';
import { OtterLocalizationDevtools } from './localization-devtools.service';
import { OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_LOCALIZATION_DEVTOOLS_OPTIONS } from './localization-devtools.token';

describe('Localization DevTools console', () => {

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: LocalizationDevtoolsConsoleService;

  beforeEach(async () => {
    jest.spyOn(console, 'info').mockImplementation();
    await TestBed.configureTestingModule({
      imports: [
        LocalizationModule
      ],
      providers: [
        LocalizationDevtoolsConsoleService,
        { provide: OtterLocalizationDevtools, useValue: {}},
        { provide: LocalizationService, useValue: { getCurrentLanguage: () => 'en' } },
        { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: OTTER_LOCALIZATION_DEVTOOLS_DEFAULT_OPTIONS }
      ]
    }).compileComponents();
    service = TestBed.inject(LocalizationDevtoolsConsoleService);
  });

  it('should be activated', () => {
    service.activate();

    // eslint-disable-next-line no-underscore-dangle
    expect((window as any)._OTTER_DEVTOOLS_?.[LocalizationDevtoolsConsoleService.windowModuleName]).toBeDefined();
  });
});
