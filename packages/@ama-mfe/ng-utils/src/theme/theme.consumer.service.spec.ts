import {
  MESSAGE_THEME_TYPE,
  Theme,
} from '@ama-mfe/messages';
import {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ConsumerManagerService,
} from '../managers/index';
import {
  ThemeConsumerService,
} from './theme.consumer.service';
import * as themeHelpers from './theme.helpers';

describe('ThemeConsumerService', () => {
  let themeHandlerService: ThemeConsumerService;
  let consumerManagerService: ConsumerManagerService;

  beforeEach(() => {
    const consumerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        ThemeConsumerService,
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock }
      ]
    });

    themeHandlerService = TestBed.inject(ThemeConsumerService);
    consumerManagerService = TestBed.inject(ConsumerManagerService);
  });

  it('should register itself when start is called', () => {
    jest.spyOn(consumerManagerService, 'register');
    themeHandlerService.start();
    expect(consumerManagerService.register).toHaveBeenCalledWith(themeHandlerService);
  });

  it('should unregister itself when stop is called', () => {
    jest.spyOn(consumerManagerService, 'unregister');
    themeHandlerService.stop();
    expect(consumerManagerService.unregister).toHaveBeenCalledWith(themeHandlerService);
  });

  it('should apply theme when a supported message is received', () => {
    jest.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
    const themeMessage: RoutedMessage<Theme> = {
      from: 'test',
      to: [],
      payload: {
        name: 'horizon',
        type: MESSAGE_THEME_TYPE,
        theme: 'css theme variables',
        version: '1.0'
      }
    };
    themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith(themeMessage.payload.theme);
  });
});
