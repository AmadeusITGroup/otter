/* eslint-disable no-undef -- document available in test env*/
import {
  Navigation,
  NavigationVersions,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
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
  let messageService: MessagePeerService<NavigationVersions>;

  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    routerEventsSubject = new Subject<any>();
    const producerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    const messageServiceMock = {
      send: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        RoutingService,
        { provide: Router, useValue: { events: routerEventsSubject.asObservable() } },
        { provide: ProducerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock },
        { provide: ActivatedRoute, useValue: { routeConfig: { path: 'test-path' } } }
      ]
    });

    navProducerService = TestBed.inject(RoutingService);
    messageService = TestBed.inject(MessagePeerService<NavigationVersions>);
    producerManagerService = TestBed.inject(ProducerManagerService);
  });

  it('should register itself when instantiated', () => {
    jest.spyOn(producerManagerService, 'register');
    expect(producerManagerService.register).toHaveBeenCalledWith(navProducerService);
  });

  it('should send navigation message via messageService if document.referrer is present', () => {
    Object.defineProperty(document, 'referrer', { value: 'some-referrer', configurable: true });
    navProducerService.handleEmbeddedRouting();

    routerEventsSubject.next(new NavigationStart(1, 'start-url'));
    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.0',
      url: 'end-url'
    });
  });

  it('should send navigation message via endpointManagerService if channelId is present and document.referrer is not present', () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    navProducerService.handleEmbeddedRouting();

    routerEventsSubject.next(new NavigationStart(1, 'start-url', undefined, { channelId: 'test-channel-id', navigationId: 1 }));
    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    expect(messageService.send).toHaveBeenCalledWith({
      type: 'navigation',
      version: '1.0',
      url: 'end-url'
    }, { to: ['test-channel-id'] });
  });

  it('should log an error if endpointManagerService.send throws an error', () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    jest.spyOn(messageService, 'send').mockImplementation(() => {
      throw new Error('send error');
    });
    // eslint-disable-next-line no-console -- spy on console error
    console.error = jest.fn();
    navProducerService.handleEmbeddedRouting();

    routerEventsSubject.next(new NavigationStart(1, 'start-url', undefined, { channelId: '123', navigationId: 1 }));
    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    // eslint-disable-next-line no-console -- check console error calls
    expect(console.error).toHaveBeenCalledWith('Error sending navigation message', expect.objectContaining({ message: 'send error' }));
  });

  it('should warn if no channelId is provided and document.referrer is not present', () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    // eslint-disable-next-line no-console -- spy on console warn
    console.warn = jest.fn();
    navProducerService.handleEmbeddedRouting();

    routerEventsSubject.next(new NavigationStart(1, 'start-url'));
    routerEventsSubject.next(new NavigationEnd(1, 'start-url', 'end-url'));

    // eslint-disable-next-line no-console -- check console warn calls
    expect(console.warn).toHaveBeenCalledWith('No channelId provided for navigation message');
  });

  it('should handle errors', () => {
    // eslint-disable-next-line no-console -- spy on console error
    console.error = jest.fn();
    const errorMessage: ErrorContent<Navigation> = { reason: 'unknown_type', source: { type: 'navigation', version: '1.0', url: '' } };

    navProducerService.handleError(errorMessage);

    // eslint-disable-next-line no-console -- check console error calls
    expect(console.error).toHaveBeenCalledWith('Error in navigation service message', errorMessage);
  });
});
