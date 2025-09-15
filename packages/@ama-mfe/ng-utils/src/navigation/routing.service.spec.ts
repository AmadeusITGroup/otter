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
  ConsumerManagerService,
  ProducerManagerService,
} from '../managers/index';
import type {
  ErrorContent,
} from '../messages/error';
import {
  RoutingService,
} from './routing.service';

describe('Navigation Producer Service', () => {
  let routingService: RoutingService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<NavigationMessage>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  let routerEventsSubject: Subject<any>;
  let mockRouter: Partial<Router>;
  let router: Router;

  beforeEach(() => {
    routerEventsSubject = new Subject<any>();
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigateByUrl: jest.fn(),
      getCurrentNavigation: jest.fn()
    };

    const consumerManagerServiceMock: Partial<ConsumerManagerService> = {
      register: jest.fn(),
      unregister: jest.fn()
    };
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
        { provide: Router, useValue: mockRouter },
        { provide: ProducerManagerService, useValue: consumerManagerServiceMock },
        { provide: ConsumerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { routeConfig: { path: 'test-path' } } }
      ]
    });

    routingService = TestBed.inject(RoutingService);
    messageService = TestBed.inject(MessagePeerService<NavigationMessage>);
    producerManagerService = TestBed.inject(ProducerManagerService);
    router = TestBed.inject(Router);
  });

  it('should register itself when instantiated', () => {
    jest.spyOn(producerManagerService, 'register');
    expect(producerManagerService.register).toHaveBeenCalledWith(routingService);
  });

  it('should send navigation message via messageService if embedded', () => {
    const mockedWindow = { ...globalThis.window };
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(mockedWindow);
    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.0',
      url: 'end-url'
    });
    windowSpy.mockRestore();
  });

  it('should not send navigation message via messageService if embedded, if the skipLocationChange is true', () => {
    const mockedWindow = { ...globalThis.window };
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(mockedWindow);
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { skipLocationChange: true } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).not.toHaveBeenCalled();
    windowSpy.mockRestore();
  });

  it('should forward received Navigation message to the router', () => {
    TestBed.runInInjectionContext(() => {
      expect(Object.keys(routingService.supportedVersions)).toEqual(['1.0']);

      void routingService.supportedVersions['1.0']({
        from: 'sender',
        to: ['receiver'],
        payload: {
          type: 'navigation',
          version: '1.0',
          url: '/test'
        }
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/test');
    });
  });

  it('should send navigation message via endpointManagerService if channelId is present and not embedded', () => {
    jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { state: { channelId: 'test-channel-id' } } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
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
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error sending navigation message', expect.objectContaining({ message: 'send error' }));
  });

  it('should warn if no channelId is provided and not embedded', () => {
    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No channelId provided for navigation message');
  });

  it('should handle errors', () => {
    const errorMessage: ErrorContent<NavigationV1_0> = { reason: 'unknown_type', source: { type: 'navigation', version: '1.0', url: '' } };

    routingService.handleError(errorMessage);

    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error in navigation service message', errorMessage);
  });
});
