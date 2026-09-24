import type {
  Mocked,
} from 'vitest';
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
} from './routing-service';

describe('Navigation Producer Service', () => {
  let routingService: RoutingService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<NavigationMessage>;
  let loggerServiceMock: Mocked<LoggerService>;

  let routerEventsSubject: Subject<any>;
  let mockRouter: Partial<Router>;
  let router: Router;
  let mockedWindow: Window;

  beforeEach(() => {
    routerEventsSubject = new Subject<any>();
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigateByUrl: vi.fn(),
      getCurrentNavigation: vi.fn()
    };

    const consumerManagerServiceMock: Partial<ConsumerManagerService> = {
      register: vi.fn(),
      unregister: vi.fn()
    };
    const producerManagerServiceMock = {
      register: vi.fn(),
      unregister: vi.fn()
    };
    const messageServiceMock = {
      send: vi.fn()
    };

    loggerServiceMock = {
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as Mocked<LoggerService>;

    mockedWindow = { ...globalThis.window };

    TestBed.configureTestingModule({
      providers: [
        RoutingService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: Router, useValue: mockRouter },
        { provide: ProducerManagerService, useValue: consumerManagerServiceMock },
        { provide: ConsumerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { routeConfig: { path: 'test-path' } } },
        { provide: Window, useValue: mockedWindow }
      ]
    });

    routingService = TestBed.inject(RoutingService);
    messageService = TestBed.inject(MessagePeerService<NavigationMessage>);
    producerManagerService = TestBed.inject(ProducerManagerService);
    router = TestBed.inject(Router);
  });

  it('should register itself when instantiated', () => {
    vi.spyOn(producerManagerService, 'register');
    expect(producerManagerService.register).toHaveBeenCalledWith(routingService);
  });

  it('should broadcast a v1.1 navigation message when embedded', () => {
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.1',
      url: 'end-url'
    });
  });

  it('should include the replaceUrl extra in the v1.1 navigation message when embedded', () => {
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { replaceUrl: true } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.1',
      url: 'end-url',
      extras: { replaceUrl: true }
    });
  });

  it('should include the replaceUrl extra in the v1.1 navigation message when not embedded', () => {
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { replaceUrl: true, state: { channelId: 'test-channel-id' } } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.1',
      url: 'end-url',
      extras: { replaceUrl: true }
    }, { to: ['test-channel-id'] });
  });

  it('should forward received v1.1 Navigation message with replaceUrl extra to the router', () => {
    TestBed.runInInjectionContext(() => {
      void routingService.supportedVersions['1.1']({
        from: 'sender',
        to: ['receiver'],
        payload: {
          type: 'navigation',
          version: '1.1',
          url: '/test',
          extras: { replaceUrl: true }
        }
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/test', { state: { triggeredByMessage: true }, replaceUrl: true });
    });
  });

  it('should not send navigation message via messageService if embedded, if the skipLocationChange is true', () => {
    Object.defineProperty(mockedWindow, 'top', { value: globalThis.window.top });
    Object.defineProperty(mockedWindow, 'self', { value: mockedWindow });
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { skipLocationChange: true } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).not.toHaveBeenCalled();
  });

  it('should forward received Navigation message to the router', () => {
    TestBed.runInInjectionContext(() => {
      expect(Object.keys(routingService.supportedVersions)).toEqual(['1.0', '1.1']);

      void routingService.supportedVersions['1.0']({
        from: 'sender',
        to: ['receiver'],
        payload: {
          type: 'navigation',
          version: '1.0',
          url: '/test'
        }
      });

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/test', { state: { triggeredByMessage: true } });
    });
  });

  it('should send navigation message via endpointManagerService if channelId is present and not embedded', () => {
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { state: { channelId: 'test-channel-id' } } } as any);

    runInInjectionContext(TestBed.inject(Injector), () => {
      routingService.handleEmbeddedRouting();
    });

    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.1',
      url: 'end-url'
    }, { to: ['test-channel-id'] });
  });

  it('should log an error if endpointManagerService.send throws an error', () => {
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({ extras: { state: { channelId: 'test-channel-id' } } } as any);
    vi.spyOn(messageService, 'send').mockImplementation(() => {
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
