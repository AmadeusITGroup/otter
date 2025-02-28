import {
  THEME_MESSAGE_TYPE,
  ThemeMessage,
} from '@ama-mfe/messages';
import {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  TestBed,
} from '@angular/core/testing';
import {
  DomSanitizer,
} from '@angular/platform-browser';
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
  let sanitizer: DomSanitizer;
  const applyThemeSpy = jest.spyOn(themeHelpers, 'applyTheme');

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

    sanitizer = TestBed.inject(DomSanitizer);
    themeHandlerService = TestBed.inject(ThemeConsumerService);
    consumerManagerService = TestBed.inject(ConsumerManagerService);
  });

  afterEach(() => {
    applyThemeSpy.mockClear();
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
    const themeMessage: RoutedMessage<ThemeMessage> = {
      from: 'test',
      to: [],
      payload: {
        name: 'horizon',
        type: THEME_MESSAGE_TYPE,
        css: 'css theme variables',
        version: '1.0'
      }
    };
    themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).toHaveBeenCalledWith(themeMessage.payload.css);
  });

  it('should apply theme when an empty string is received', () => {
    jest.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
    const themeMessage: RoutedMessage<ThemeMessage> = {
      from: 'test',
      to: [],
      payload: {
        name: 'horizon',
        type: THEME_MESSAGE_TYPE,
        css: '',
        version: '1.0'
      }
    };
    themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).toHaveBeenCalledWith(themeMessage.payload.css);
  });

  it('should not apply theme when received style fails the sanitization', () => {
    jest.spyOn(sanitizer, 'sanitize').mockImplementation(() => null);
    jest.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
    const themeMessage: RoutedMessage<ThemeMessage> = {
      from: 'test',
      to: [],
      payload: {
        name: 'horizon',
        type: THEME_MESSAGE_TYPE,
        css: 'background: url(javascript:alert("XSS"))',
        version: '1.0'
      }
    };
    themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).not.toHaveBeenCalled();
  });
});
