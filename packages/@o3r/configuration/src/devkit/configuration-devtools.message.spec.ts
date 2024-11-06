import {
  getTestBed,
  TestBed
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {
  provideMockStore
} from '@ngrx/store/testing';
import {
  applicationMessageTarget,
  ConnectContentMessage,
  OtterMessage,
  otterMessageType
} from '@o3r/core';
import {
  LoggerModule,
  noopLogger
} from '@o3r/logger';
import {
  ConfigurationDevtoolsMessageService
} from './configuration-devtools.message.service';
import {
  OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_CONFIGURATION_DEVTOOLS_OPTIONS
} from './configuration-devtools.token';

const connectMessage: OtterMessage<ConnectContentMessage, typeof applicationMessageTarget> = {
  type: otterMessageType,
  to: applicationMessageTarget,
  content: {
    dataType: 'connect'
  }
};

describe('Configuration DevTools message', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: ConfigurationDevtoolsMessageService;
  // let mockStore: MockStore<ConfigurationState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(noopLogger)
      ],
      providers: [
        ConfigurationDevtoolsMessageService,
        { provide: OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, useValue: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS },
        provideMockStore({
          initialState: {
            configuration: {
              ids: ['@scope/package#componentTest'],
              entities: {
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
    service = TestBed.inject(ConfigurationDevtoolsMessageService);
  });

  it('should be activated', () => {
    const postmessage = jest.spyOn<any, any>(window, 'postMessage');

    service.activate();

    expect(postmessage).toHaveBeenCalledTimes(1);
  });

  it('should ignore message when not activated', () => {
    const handleEvents = jest.spyOn<any, any>(service, 'handleEvents');

    window.top.postMessage(connectMessage, '*');

    expect(handleEvents).not.toHaveBeenCalled();
  });

  it('should send the application on plugin connect', () => {
    const connectPlugin = jest.spyOn<any, any>(service, 'connectPlugin');

    (service as any).handleEvents(connectMessage.content);

    expect(connectPlugin).toHaveBeenCalled();
  });
});
