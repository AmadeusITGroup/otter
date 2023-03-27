/* eslint-disable no-console */
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RulesEngineDevtoolsConsoleService } from './rules-engine-devtools.console.service';
import { OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS } from './rules-engine-devtools.token';
import { OtterRulesEngineDevtools } from './rules-engine-devtools.service';

describe('Rules Engine DevTools console', () => {

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: RulesEngineDevtoolsConsoleService;

  beforeEach(async () => {
    jest.spyOn(console, 'info').mockImplementation();
    await TestBed.configureTestingModule({
      providers: [
        RulesEngineDevtoolsConsoleService,
        { provide: OtterRulesEngineDevtools, useValue: {} },
        { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS }
      ]
    }).compileComponents();
    service = TestBed.inject(RulesEngineDevtoolsConsoleService);
  });

  it('should be activated', () => {
    service.activate();

    // eslint-disable-next-line no-underscore-dangle
    expect((window as any)._OTTER_DEVTOOLS_?.[RulesEngineDevtoolsConsoleService.windowModuleName]).toBeDefined();
  });
});
