import {
  NAVIGATION_REQUEST_MESSAGE_TYPE,
  type NavigationRequestV1_0,
} from '@ama-mfe/messages';
import {
  TestBed,
} from '@angular/core/testing';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConsumerManagerService,
} from '../../../managers';
import {
  NavigationRequestConsumerService,
} from './navigation-request-consumer.service';
import {
  NAVIGATION_REQUEST_HANDLER,
  type NavigationRequestHandler,
} from './navigation-request-handler';
import {
  NavigationRequestManagerService,
} from './navigation-request-manager.service';

describe('NavigationRequestConsumerService', () => {
  let consumerManager: { register: jest.Mock; unregister: jest.Mock };
  let producer: { sendDecision: jest.Mock };
  let logger: { error: jest.Mock };
  let handler: { handle: jest.Mock<ReturnType<NavigationRequestHandler['handle']>, Parameters<NavigationRequestHandler['handle']>> };

  const buildMessage = (overrides: Partial<NavigationRequestV1_0> = {}) => ({
    from: 'booking',
    to: ['cockpit'],
    payload: {
      type: NAVIGATION_REQUEST_MESSAGE_TYPE,
      version: '1.0',
      correlationId: 'corr-1',
      reason: 'dirty',
      ...overrides
    } satisfies NavigationRequestV1_0
  });

  const buildTestBed = (handlerProvider?: { provide: typeof NAVIGATION_REQUEST_HANDLER; useValue: NavigationRequestHandler }) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ConsumerManagerService, useValue: consumerManager },
        { provide: NavigationRequestManagerService, useValue: producer },
        { provide: LoggerService, useValue: logger },
        ...(handlerProvider ? [handlerProvider] : []),
        NavigationRequestConsumerService
      ]
    });
    return TestBed.inject(NavigationRequestConsumerService);
  };

  beforeEach(() => {
    consumerManager = { register: jest.fn(), unregister: jest.fn() };
    producer = { sendDecision: jest.fn() };
    logger = { error: jest.fn() };
    handler = { handle: jest.fn() as jest.Mock<ReturnType<NavigationRequestHandler['handle']>, Parameters<NavigationRequestHandler['handle']>> };
  });

  it('should declare the navigation-request type', () => {
    const service = buildTestBed();
    expect(service.type).toBe(NAVIGATION_REQUEST_MESSAGE_TYPE);
  });

  it('should register on start', () => {
    const service = buildTestBed();
    expect(consumerManager.register).not.toHaveBeenCalled();
    service.start();
    expect(consumerManager.register).toHaveBeenCalledWith(service);
  });

  it('should invoke the handler and send a decision when it resolves', async () => {
    handler.handle.mockResolvedValue(undefined);
    const service = buildTestBed({ provide: NAVIGATION_REQUEST_HANDLER, useValue: handler });
    await service.supportedVersions['1.0'](buildMessage());
    expect(handler.handle).toHaveBeenCalledWith({ from: 'booking', reason: 'dirty' });
    expect(producer.sendDecision).toHaveBeenCalledWith('corr-1', 'booking');
  });

  it('should send a decision with proceed=false and log the error when the handler rejects', async () => {
    const error = new Error('cancelled');
    handler.handle.mockRejectedValue(error);
    const service = buildTestBed({ provide: NAVIGATION_REQUEST_HANDLER, useValue: handler });
    await service.supportedVersions['1.0'](buildMessage());
    expect(producer.sendDecision).toHaveBeenCalledWith('corr-1', 'booking', false);
    expect(logger.error).toHaveBeenCalledWith(expect.any(String), error, expect.anything());
  });

  it('should use the default handler when no custom handler is provided', async () => {
    // Default handler should be the module handler that unblocks
    const service = buildTestBed();
    await service.supportedVersions['1.0'](buildMessage());
    // Default handler resolves, so decision should be sent
    expect(producer.sendDecision).toHaveBeenCalledWith('corr-1', 'booking');
  });

  it('should unregister on stop', () => {
    const service = buildTestBed();
    service.start();
    service.stop();
    expect(consumerManager.unregister).toHaveBeenCalledWith(service);
  });

  it('should unregister on destroy when started', () => {
    const service = buildTestBed();
    service.start();
    consumerManager.unregister.mockClear();
    TestBed.resetTestingModule();
    expect(consumerManager.unregister).toHaveBeenCalledWith(service);
  });
});
