import type {
  Mocked,
} from 'vitest';
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
  LoggerService,
} from '@o3r/logger';
import {
  ConsumerManagerService,
} from '../managers/index';
import {
  ThemeConsumerService,
} from './theme-consumer-service';
import * as themeHelpers from './theme-helpers';

describe('ThemeConsumerService', () => {
  let themeHandlerService: ThemeConsumerService;
  let consumerManagerService: ConsumerManagerService;
  let sanitizer: DomSanitizer;
  let loggerServiceMock: Mocked<LoggerService>;
  const applyThemeSpy = vi.spyOn(themeHelpers, 'applyTheme');
  const downloadApplicationThemeCssSpy = vi.spyOn(themeHelpers, 'downloadApplicationThemeCss');

  beforeEach(() => {
    const consumerManagerServiceMock = {
      register: vi.fn(),
      unregister: vi.fn()
    };

    loggerServiceMock = {
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as Mocked<LoggerService>;

    TestBed.configureTestingModule({
      providers: [
        ThemeConsumerService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock }
      ]
    });

    sanitizer = TestBed.inject(DomSanitizer);
    themeHandlerService = TestBed.inject(ThemeConsumerService);
    consumerManagerService = TestBed.inject(ConsumerManagerService);
  });

  afterEach(() => {
    applyThemeSpy.mockClear();
    downloadApplicationThemeCssSpy.mockClear();
  });

  it('should register itself when start is called', () => {
    vi.spyOn(consumerManagerService, 'register');
    themeHandlerService.start();
    expect(consumerManagerService.register).toHaveBeenCalledWith(themeHandlerService);
  });

  it('should unregister itself when stop is called', () => {
    vi.spyOn(consumerManagerService, 'unregister');
    themeHandlerService.stop();
    expect(consumerManagerService.unregister).toHaveBeenCalledWith(themeHandlerService);
  });

  it('should apply theme when a supported message is received', async () => {
    vi.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
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
    await themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).toHaveBeenCalledWith(themeMessage.payload.css);
  });

  it('should apply theme and retrieve local CSS when a supported message is received', async () => {
    vi.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
    vi.spyOn(themeHelpers, 'downloadApplicationThemeCss').mockResolvedValue('test css');
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
    await themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(downloadApplicationThemeCssSpy).toHaveBeenCalledWith('horizon', expect.objectContaining({}));
    expect(applyThemeSpy).toHaveBeenNthCalledWith(1, themeMessage.payload.css);
    expect(applyThemeSpy).toHaveBeenNthCalledWith(2, 'test css', false);
  });

  it('should apply theme and warn when not local file', async () => {
    vi.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
    vi.spyOn(themeHelpers, 'downloadApplicationThemeCss').mockRejectedValue('no local css');

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
    await themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(downloadApplicationThemeCssSpy).toHaveBeenCalledWith('horizon', expect.objectContaining({}));
    expect(applyThemeSpy).toHaveBeenCalledWith(themeMessage.payload.css);
    expect(applyThemeSpy).toHaveBeenCalledTimes(1);
    expect(loggerServiceMock.warn).toHaveBeenCalledWith(expect.stringMatching(/.+/), 'no local css');
  });

  it('should apply theme when an empty string is received', async () => {
    vi.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
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
    await themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).toHaveBeenCalledWith(themeMessage.payload.css);
  });

  it('should not apply theme when received style fails the sanitization', async () => {
    vi.spyOn(sanitizer, 'sanitize').mockImplementation(() => null);
    vi.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => '');
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
    await themeHandlerService.supportedVersions['1.0'](themeMessage);
    expect(applyThemeSpy).not.toHaveBeenCalled();
  });
});
