import {
  ResizeMessage,
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
  ProducerManagerService,
} from '../managers/index';
import {
  ErrorContent,
} from '../messages/index';
import {
  DELTA_RESIZE,
  ResizeService,
} from './resize.producer.service';

class MockedResizeObserver {
  public observe = jest.fn();
  public unobserve = jest.fn();
  public disconnect = jest.fn();
  public observerCallback;
  constructor(funct: any) {
    this.observerCallback = funct;
  }
}

describe('ResizeService', () => {
  let resizeService: ResizeService;
  let producerManagerService: ProducerManagerService;
  let messageService: MessagePeerService<ResizeMessage>;
  let injector: Injector;

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
        ResizeService,
        { provide: ProducerManagerService, useValue: producerManagerServiceMock },
        { provide: MessagePeerService, useValue: messageServiceMock }
      ]
    });

    resizeService = TestBed.inject(ResizeService);
    messageService = TestBed.inject(MessagePeerService<ResizeMessage>);
    producerManagerService = TestBed.inject(ProducerManagerService);
    injector = TestBed.inject(Injector);
  });

  it('should register itself when instantiated', () => {
    expect(producerManagerService.register).toHaveBeenCalledWith(resizeService);
  });

  it('should send resize message via messageService when body height changes', () => {
    global.ResizeObserver = MockedResizeObserver;
    runInInjectionContext(injector, () => {
      resizeService.startResizeObserver();

      Object.defineProperty(document.body, 'scrollHeight', { value: 1000, configurable: true });

      // simulate observer change as there is no api for ResizeObserver in jest
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation -- access a private property for test
      const resizeObserverInstance = (resizeService as any)['resizeObserver'];
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1000 + DELTA_RESIZE, type: 'resize', version: '1.0' });

      Object.defineProperty(document.body, 'scrollHeight', { value: 1200, configurable: true });
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1200 + DELTA_RESIZE, type: 'resize', version: '1.0' });
    });
  });

  it('should not send resize message when body height changes with less then DELTA_RESIZE', () => {
    global.ResizeObserver = MockedResizeObserver;
    runInInjectionContext(injector, () => {
      resizeService.startResizeObserver();

      Object.defineProperty(document.body, 'scrollHeight', { value: 1000, configurable: true });

      // simulate observer change as there is no api for ResizeObserver in jest
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation -- access a private property for test
      const resizeObserverInstance = (resizeService as any)['resizeObserver'];
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1000 + DELTA_RESIZE, type: 'resize', version: '1.0' });
      jest.clearAllMocks();
      Object.defineProperty(document.body, 'scrollHeight', { value: 1001.6, configurable: true });
      Object.defineProperty(document.body, 'scrollHeight', { value: 1000.3, configurable: true });
      resizeObserverInstance.observerCallback();
      expect(messageService.send).not.toHaveBeenCalled();
      Object.defineProperty(document.body, 'scrollHeight', { value: 1008.2, configurable: true });
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1008.2 + DELTA_RESIZE, type: 'resize', version: '1.0' });
    });
  });

  it('should handle errors', () => {
    // eslint-disable-next-line no-console -- spy on console error
    console.error = jest.fn();
    const errorMessage: ErrorContent<ResizeMessage> = { reason: 'unknown_type', source: { type: 'resize', version: '1.0', height: 0 } };

    resizeService.handleError(errorMessage);

    // eslint-disable-next-line no-console -- listen to console error calls
    expect(console.error).toHaveBeenCalledWith('Error in resize service message', errorMessage);
  });
});
