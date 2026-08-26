import {
  NAVIGATION_DECISION_MESSAGE_TYPE,
  type NavigationDecisionV1_0,
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
  NavigationRequestManagerService,
} from '../navigation-request/navigation-request-manager.service';
import {
  NavigationDecisionConsumerService,
} from './navigation-decision-consumer.service';

describe('NavigationDecisionConsumerService', () => {
  let consumerManager: { register: jest.Mock; unregister: jest.Mock };
  let producer: { resolvePendingRequest: jest.Mock };
  let service: NavigationDecisionConsumerService;

  beforeEach(() => {
    consumerManager = { register: jest.fn(), unregister: jest.fn() };
    producer = { resolvePendingRequest: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConsumerManagerService, useValue: consumerManager },
        { provide: NavigationRequestManagerService, useValue: producer },
        { provide: LoggerService, useValue: { warn: jest.fn(), error: jest.fn() } },
        NavigationDecisionConsumerService
      ]
    });
    service = TestBed.inject(NavigationDecisionConsumerService);
  });

  it('should declare the decision message type', () => {
    expect(service.type).toBe(NAVIGATION_DECISION_MESSAGE_TYPE);
  });

  it('should register on start', () => {
    expect(consumerManager.register).not.toHaveBeenCalled();
    service.start();
    expect(consumerManager.register).toHaveBeenCalledWith(service);
  });

  it('should forward v1 decisions to the producer', () => {
    service.supportedVersions['1.0']({
      from: 'cockpit',
      to: ['booking'],
      payload: {
        type: NAVIGATION_DECISION_MESSAGE_TYPE,
        version: '1.0',
        correlationId: 'corr-1',
        proceed: true
      } satisfies NavigationDecisionV1_0
    });
    expect(producer.resolvePendingRequest).toHaveBeenCalledWith('corr-1', true);
  });

  it('should unregister on stop', () => {
    service.start();
    service.stop();
    expect(consumerManager.unregister).toHaveBeenCalledWith(service);
  });

  it('should unregister on destroy when started', () => {
    service.start();
    consumerManager.unregister.mockClear();
    TestBed.resetTestingModule();
    expect(consumerManager.unregister).toHaveBeenCalledWith(service);
  });
});
