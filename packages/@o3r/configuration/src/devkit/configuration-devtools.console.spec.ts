/* eslint-disable no-console */
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ConfigurationState } from '../stores';
import { ConfigurationDevtoolsConsoleService } from './configuration-devtools.console.service';
import { OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_CONFIGURATION_DEVTOOLS_OPTIONS } from './configuration-devtools.token';

describe('Configuration DevTools console', () => {

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: ConfigurationDevtoolsConsoleService;
  let mockStore: MockStore<ConfigurationState>;

  beforeEach(async () => {
    jest.spyOn(console, 'info').mockImplementation();
    await TestBed.configureTestingModule({
      providers: [
        ConfigurationDevtoolsConsoleService,
        { provide: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, useValue: OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS },
        provideMockStore({
          initialState: {
            configuration: {
              ids: ['@scope/package#componentTest'],
              entities: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@scope/package#componentTest': {
                  configEx1: 'test',
                  configEx2: true,
                  id: '@scope/package#componentTest'
                }
              }
            }
          }
        })
      ]
    }).compileComponents();
    service = TestBed.inject(ConfigurationDevtoolsConsoleService);
    mockStore = TestBed.inject(MockStore);
  });

  it('should be activated', () => {
    service.activate();

    // eslint-disable-next-line no-underscore-dangle
    expect((window as any)._OTTER_DEVTOOLS_?.[ConfigurationDevtoolsConsoleService.windowModuleName]).toBeDefined();
  });

  it('should display the whole configuration', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    await service.displayConfiguration();

    expect(consoleLog).toHaveBeenCalledWith(
      [{
        name: 'componentTest',
        library: '@scope/package',
        config: {
          configEx1: 'test',
          configEx2: true
        }
      }]
    );
  });

  it('should display the configuration of componentTest', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    await service.displayCurrentConfigurationFor('@scope/package#componentTest');

    expect(consoleLog).toHaveBeenCalledWith({configEx1: 'test', configEx2: true});
  });

  it('should set new configuration', () => {
    mockStore.dispatch = jest.fn();
    service.setDynamicConfig('@scope/package#componentTest', 'lolProp', 123);

    expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      id: '@scope/package#componentTest',
      configuration: {
        lolProp: 123
      }
    }));
  });

  it('should upsert new configurations', () => {
    mockStore.dispatch = jest.fn();
    service.updateConfigurations('[{"library":"@scope/package","name":"componentTest","config":{"lolProp":123}}]');

    expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining(
      {
        entities: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@scope/package#componentTest': {
            id: '@scope/package#componentTest',
            lolProp: 123
          }
        }
      }));
  });
});
