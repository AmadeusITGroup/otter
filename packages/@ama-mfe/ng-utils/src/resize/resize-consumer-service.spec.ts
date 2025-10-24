import {
  RESIZE_MESSAGE_TYPE,
  ResizeMessage,
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
  ResizeConsumerService,
} from './resize-consumer-service';

describe('ResizeConsumerService', () => {
  let resizeHandlerService: ResizeConsumerService;
  let consumerManagerService: ConsumerManagerService;

  beforeEach(() => {
    const consumerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        ResizeConsumerService,
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock }
      ]
    });

    resizeHandlerService = TestBed.inject(ResizeConsumerService);
    consumerManagerService = TestBed.inject(ConsumerManagerService);
  });

  it('should register itself when start is called', () => {
    resizeHandlerService.start();
    expect(consumerManagerService.register).toHaveBeenCalledWith(resizeHandlerService);
  });

  it('should unregister itself when stop is called', () => {
    resizeHandlerService.stop();
    expect(consumerManagerService.unregister).toHaveBeenCalledWith(resizeHandlerService);
  });

  it('should set newHeight when a supported message is received', () => {
    const resizeMessage: RoutedMessage<ResizeMessage> = {
      from: 'test',
      to: [],
      payload: {
        height: 500,
        type: 'resize',
        version: '1.0'
      }
    };
    resizeHandlerService.supportedVersions['1.0'](resizeMessage);
    expect(resizeHandlerService.newHeightFromChannel()).toEqual({ height: 500, channelId: 'test' });
  });

  it('should have the correct message type', () => {
    expect(resizeHandlerService.type).toBe(RESIZE_MESSAGE_TYPE);
  });
});
