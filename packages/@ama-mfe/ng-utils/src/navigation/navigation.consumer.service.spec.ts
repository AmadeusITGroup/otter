import {
  NavigationMessage,
} from '@ama-mfe/messages';
import {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  ConsumerManagerService,
} from '../managers/index';
import {
  NavigationConsumerService,
} from './navigation.consumer.service';

describe('Navigation Handler Service', () => {
  let navHandlerService: NavigationConsumerService;
  let consumerManagerService: ConsumerManagerService;
  let router: Router;

  beforeEach(() => {
    const consumerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        NavigationConsumerService,
        Router,
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock },
        {
          provide: ActivatedRoute, useValue: {
            routeConfig: { path: 'test-path' },
            children: [
              { routeConfid: { path: 'child1' } },
              { routeConfid: { path: 'child2' } }
            ]
          }
        }
      ]
    });

    navHandlerService = TestBed.inject(NavigationConsumerService);
    consumerManagerService = TestBed.inject(ConsumerManagerService);
    router = TestBed.inject(Router);
  });

  it('should register itself when start is called', () => {
    jest.spyOn(consumerManagerService, 'register');
    navHandlerService.start();
    expect(consumerManagerService.register).toHaveBeenCalledWith(navHandlerService);
  });

  it('should unregister itself when stop is called', () => {
    jest.spyOn(consumerManagerService, 'unregister');
    navHandlerService.stop();
    expect(consumerManagerService.unregister).toHaveBeenCalledWith(navHandlerService);
  });

  it('should call navigate when a supported message is received', () => {
    jest.spyOn(navHandlerService as any, 'navigate');
    const navMessage: RoutedMessage<NavigationMessage> = {
      from: 'test',
      to: [],
      payload: {
        type: 'navigation',
        url: '/go-to/sub-path',
        version: '1.0'
      }
    };
    navHandlerService.supportedVersions['1.0'](navMessage);
    expect((navHandlerService as any).navigate).toHaveBeenCalledWith(navMessage.payload.url, 'test');
  });

  // eslint-disable-next-line jest/no-done-callback -- use the callback function to finish the test
  it('should emit via the requestedUrl observable when a supported message is received', (done) => {
    jest.spyOn(navHandlerService as any, 'navigate');
    const navMessage: RoutedMessage<NavigationMessage> = {
      from: 'test',
      to: [],
      payload: {
        type: 'navigation',
        url: '/go-to/sub-path',
        version: '1.0'
      }
    };
    navHandlerService.requestedUrl$.subscribe((requestedObj) => {
      expect(requestedObj.url).toBe(navMessage.payload.url);
      expect(requestedObj.channelId).toBe('test');
      done();
    });
    navHandlerService.supportedVersions['1.0'](navMessage);
  });

  it('should call the router navigate when a supported message is received', () => {
    jest.spyOn(router, 'navigate');
    const navMessage: RoutedMessage<NavigationMessage> = {
      from: 'test',
      to: [],
      payload: {
        type: 'navigation',
        url: '/go-to/sub-path',
        version: '1.0'
      }
    };
    navHandlerService.supportedVersions['1.0'](navMessage);
    expect(router.navigate).toHaveBeenCalledWith(
      ['go-to', 'sub-path'],
      expect.objectContaining({
        state: { channelId: 'test' },
        relativeTo: { routeConfid: { path: 'child2' } }
      }));
  });
});
