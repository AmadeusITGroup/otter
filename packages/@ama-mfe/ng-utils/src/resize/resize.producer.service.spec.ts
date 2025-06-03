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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should register itself when instantiated', () => {
    expect(producerManagerService.register).toHaveBeenCalledWith(resizeService);
  });

  it('should send resize message via messageService when body height changes', () => {
    global.ResizeObserver = MockedResizeObserver;
    runInInjectionContext(injector, () => {
      resizeService.startResizeObserver();

      jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ height: 1000 } as DOMRect);

      // simulate observer change as there is no api for ResizeObserver in jest
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation -- access a private property for test
      const resizeObserverInstance = (resizeService as any)['resizeObserver'];

      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1000, type: 'resize', version: '1.0' });

      jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ height: 1200 } as DOMRect);

      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1200, type: 'resize', version: '1.0' });
    });
  });

  it('should not send resize message when body height does not change', () => {
    global.ResizeObserver = MockedResizeObserver;
    runInInjectionContext(injector, () => {
      resizeService.startResizeObserver();

      jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ height: 101 } as DOMRect);

      // simulate observer change as there is no api for ResizeObserver in jest
      // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation -- access a private property for test
      const resizeObserverInstance = (resizeService as any)['resizeObserver'];
      resizeObserverInstance.observerCallback();
      jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ height: 101 } as DOMRect);
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledTimes(1);
      expect(messageService.send).toHaveBeenCalledWith({ height: 101, type: 'resize', version: '1.0' });
      jest.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({ height: 1008.2 } as DOMRect);
      resizeObserverInstance.observerCallback();
      expect(messageService.send).toHaveBeenCalledWith({ height: 1008.2, type: 'resize', version: '1.0' });
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
