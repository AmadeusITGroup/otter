import {
  ThemeMessage,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  TestBed,
} from '@angular/core/testing';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ProducerManagerService,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/index';
import * as themeHelpers from './theme-helpers';
import {
  ThemeProducerService,
} from './theme-producer-service';

describe('ThemeProducerService', () => {
  let themeService: ThemeProducerService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<ThemeMessage>;
  let loggerServiceMock: jest.Mocked<LoggerService>;
  let mockWindow: { location: { href: string; toString?: () => string } };

  const css = 'body { background-color: black; }';

  beforeAll(() => {
    jest.spyOn(themeHelpers, 'getStyle').mockImplementation(() => Promise.resolve(css));
    jest.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => {});

    mockWindow = {
      location: {
        href: 'https://example.com?theme=red',
        toString: () => {
          return mockWindow.location.href;
        }
      }
    };
  });

  beforeEach(() => {
    const producerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    const messageServiceMock = {
      send: jest.fn()
    };

    loggerServiceMock = {
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;

    TestBed.configureTestingModule({
      providers: [
        ThemeProducerService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ProducerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock },
        { provide: Window, useValue: mockWindow }
      ]
    });

    themeService = TestBed.inject(ThemeProducerService);
    producerManagerService = TestBed.inject(ProducerManagerService);
    messageService = TestBed.inject<MessagePeerService<ThemeMessage>>(MessagePeerService);
  });

  it('should register itself when instantiated', () => {
    expect(producerManagerService.register).toHaveBeenCalledWith(themeService);
  });

  it('should change theme and apply it', async () => {
    const themeName = 'dark';
    await themeService.changeTheme(themeName);
    expect(themeService.currentTheme()).toEqual({ name: themeName, css });
  });

  it('should revert to previous theme', async () => {
    await themeService.changeTheme('light');
    expect(themeService.currentTheme()).toEqual({ name: 'light', css });
    await themeService.changeTheme('dark');
    expect(themeService.currentTheme()).toEqual({ name: 'dark', css });
    themeService.revertToPreviousTheme();
    expect(themeService.currentTheme()).toEqual({ name: 'light', css });
  });

  it('should handle errors and revert to previous theme', () => {
    const errorMessage: ErrorContent<ThemeMessage> = { reason: 'unknown_type', source: { type: 'theme', version: '1.0', name: '', css: '' } };
    jest.spyOn(themeService, 'revertToPreviousTheme');
    themeService.handleError(errorMessage);
    expect(themeService.revertToPreviousTheme).toHaveBeenCalled();
    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error in theme service message', errorMessage);
  });

  it('should get theme name from the url and call the change theme at init', () => {
    expect(themeService.currentTheme()?.name).toBe('red');
    expect(themeHelpers.getStyle).toHaveBeenCalledWith('red-theme.css');
    TestBed.tick();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith(css);
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'red',
      css,
      type: 'theme',
      version: '1.0'
    });
  });

  it('should send a new message when theme is changed', async () => {
    TestBed.tick();
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'red',
      css,
      type: 'theme',
      version: '1.0'
    });
    await themeService.changeTheme('light');
    TestBed.tick();
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'light',
      css,
      type: 'theme',
      version: '1.0'
    });
  });

  it('should call applyTheme when theme is changed', async () => {
    TestBed.tick();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith(css);
    jest.spyOn(themeHelpers, 'getStyle').mockImplementation(() => Promise.resolve('newCss'));
    await themeService.changeTheme('light');
    TestBed.tick();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith('newCss');
  });
});
