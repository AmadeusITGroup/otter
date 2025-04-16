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
  ProducerManagerService,
} from '../managers/index';
import {
  type ErrorContent,
} from '../messages/index';
import * as themeHelpers from './theme.helpers';
import {
  ThemeProducerService,
} from './theme.producer.service';

describe('ThemeProducerService', () => {
  let themeService: ThemeProducerService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<ThemeMessage>;
  const css = 'body { background-color: black; }';

  beforeAll(() => {
    jest.spyOn(themeHelpers, 'getStyle').mockImplementation(() => Promise.resolve(css));
    jest.spyOn(themeHelpers, 'applyTheme').mockImplementation(() => {});

    Object.defineProperty(window, 'location',
      {
        value: 'https://example.com?theme=red',
        configurable: true
      });
  });

  beforeEach(() => {
    const producerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    const messageServiceMock = {
      send: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeProducerService,
        { provide: ProducerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock }
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
    jest.spyOn(console, 'error').mockImplementation(() => {});
    themeService.handleError(errorMessage);
    expect(themeService.revertToPreviousTheme).toHaveBeenCalled();
    // eslint-disable-next-line no-console -- checking that the console error is called
    expect(console.error).toHaveBeenCalledWith('Error in theme service message', errorMessage);
  });

  it('should get theme name from the url and call the change theme at init', () => {
    expect(themeService.currentTheme()?.name).toBe('red');
    expect(themeHelpers.getStyle).toHaveBeenCalledWith('red-theme.css');
    TestBed.flushEffects();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith(css);
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'red',
      css,
      type: 'theme',
      version: '1.0'
    });
  });

  it('should send a new message when theme is changed', async () => {
    TestBed.flushEffects();
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'red',
      css,
      type: 'theme',
      version: '1.0'
    });
    await themeService.changeTheme('light');
    TestBed.flushEffects();
    expect(messageService.send).toHaveBeenCalledWith({
      name: 'light',
      css,
      type: 'theme',
      version: '1.0'
    });
  });

  it('should call applyTheme when theme is changed', async () => {
    TestBed.flushEffects();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith(css);
    jest.spyOn(themeHelpers, 'getStyle').mockImplementation(() => Promise.resolve('newCss'));
    await themeService.changeTheme('light');
    TestBed.flushEffects();
    expect(themeHelpers.applyTheme).toHaveBeenCalledWith('newCss');
  });
});
