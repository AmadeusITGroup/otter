import {
  NavigationMessage,
  NavigationV1_0,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  LoggerService,
} from '@o3r/logger';
import {
  Subject,
} from 'rxjs';
import {
  ProducerManagerService,
} from '../managers/index';
import type {
  ErrorContent,
} from '../messages/error';
import {
  RoutingService,
} from './navigation.producer.service';

describe('Navigation Producer Service', () => {
  let navProducerService: RoutingService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<NavigationMessage>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  let routerEventsSubject: Subject<any>;
  let router: Router;

  beforeEach(() => {
    routerEventsSubject = new Subject<any>();
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
        RoutingService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: Router, useValue: { events: routerEventsSubject.asObservable(), getCurrentNavigation: jest.fn(() => {}) } },
        { provide: ProducerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { routeConfig: { path: 'test-path' } } }
      ]
    });

    navProducerService = TestBed.inject(RoutingService);
    messageService = TestBed.inject(MessagePeerService<NavigationMessage>);
    producerManagerService = TestBed.inject(ProducerManagerService);
    router = TestBed.inject(Router);
  });

  it('should register itself when instantiated', () => {
    jest.spyOn(producerManagerService, 'register');
    expect(producerManagerService.register).toHaveBeenCalledWith(navProducerService);
  });

  it('should send navigation message via messageService if embedded', () => {
    const mockedWindow = { ...globalThis.window };
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(mockedWindow);
    runInInjectionContext(TestBed.inject(Injector), () => {
      navProducerService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.0',
      url: 'end-url'
    });
    windowSpy.mockRestore();
  });

  it('should send navigation message via endpointManagerService if channelId is present and not embedded', () => {
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { state: { channelId: 'test-channel-id' } } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      navProducerService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.0',
      url: 'end-url'
    }, { to: ['test-channel-id'] });
  });

  it('should log an error if endpointManagerService.send throws an error', () => {
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { state: { channelId: 'test-channel-id' } } } as any);
    jest.spyOn(messageService, 'send').mockImplementation(() => {
      throw new Error('send error');
    });

    runInInjectionContext(TestBed.inject(Injector), () => {
      navProducerService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error sending navigation message', expect.objectContaining({ message: 'send error' }));
  });

  it('should warn if no channelId is provided and not embedded', () => {
    runInInjectionContext(TestBed.inject(Injector), () => {
      navProducerService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No channelId provided for navigation message');
  });

  it('should handle errors', () => {
    const errorMessage: ErrorContent<NavigationV1_0> = { reason: 'unknown_type', source: { type: 'navigation', version: '1.0', url: '' } };

    navProducerService.handleError(errorMessage);

    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error in navigation service message', errorMessage);
  });
});
