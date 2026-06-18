import {
  NAVIGATION_DECISION_MESSAGE_TYPE,
  NAVIGATION_REQUEST_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import {
  TestBed,
} from '@angular/core/testing';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConnectionService,
} from '../../../connect/connect-resources';
import {
  ProducerManagerService,
} from '../../../managers';
import {
  NavigationRequestManagerService,
} from './navigation-request-manager.service';

describe('NavigationRequestManagerService', () => {
  let connectionService: { send: jest.Mock };
  let producerManager: { register: jest.Mock; unregister: jest.Mock };
  let logger: { error: jest.Mock };
  let service: NavigationRequestManagerService;

  beforeEach(() => {
    connectionService = { send: jest.fn() };
    producerManager = { register: jest.fn(), unregister: jest.fn() };
    logger = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConnectionService, useValue: connectionService },
        { provide: ProducerManagerService, useValue: producerManager },
        { provide: LoggerService, useValue: logger },
        NavigationRequestManagerService
      ]
    });
    service = TestBed.inject(NavigationRequestManagerService);
  });

  it('should declare the request and decision message types', () => {
    expect(service.types).toEqual([NAVIGATION_REQUEST_MESSAGE_TYPE, NAVIGATION_DECISION_MESSAGE_TYPE]);
  });

  it('should auto-register with the producer manager', () => {
    expect(producerManager.register).toHaveBeenCalledWith(service);
  });

  describe('requestNavigation', () => {
    it('should broadcast a request (no target) and resolve on matching decision', async () => {
      const promise = service.requestNavigation(undefined, 'leave?');
      const calls = connectionService.send.mock.calls as [message: { type: string; reason?: string; correlationId: string }, options?: { to: string }][];
      const lastCall = calls.at(-1);
      expect(lastCall).toBeDefined();
      const [msg, options] = lastCall;
      expect(msg.type).toBe(NAVIGATION_REQUEST_MESSAGE_TYPE);
      expect(msg.reason).toBe('leave?');
      expect(typeof msg.correlationId).toBe('string');
      expect(options).toBeUndefined();

      service.resolvePendingRequest(msg.correlationId, true);
      await expect(promise).resolves.toBe(true);
    });

    it('should target a specific peer when a target is provided', () => {
      void service.requestNavigation('booking');
      const calls = connectionService.send.mock.calls as [message: unknown, options?: { to: string }][];
      const lastCall = calls.at(-1);
      expect(lastCall).toBeDefined();
      const [, options] = lastCall;
      expect(options).toEqual({ to: 'booking' });
    });

    it('should ignore decisions with a mismatched correlation id and keep the promise pending', async () => {
      const promise = service.requestNavigation();
      service.resolvePendingRequest('not-a-match', true);
      let settled: 'pending' | 'resolved' = 'pending';
      void promise.then(() => {
        settled = 'resolved';
      });
      await Promise.resolve();
      await Promise.resolve();
      expect(settled).toBe('pending');
    });

    it('should coalesce concurrent calls to the same in-flight promise', async () => {
      const first = service.requestNavigation();
      const second = service.requestNavigation();
      expect(first).toBe(second);
      const calls = connectionService.send.mock.calls as [message: { type: string; correlationId: string }][];
      const requests = calls.filter((call) => call[0].type === NAVIGATION_REQUEST_MESSAGE_TYPE);
      expect(requests).toHaveLength(1);
      const firstRequest = requests[0];
      expect(firstRequest).toBeDefined();
      const correlationId = firstRequest[0].correlationId;
      service.resolvePendingRequest(correlationId, false);
      await expect(first).resolves.toBe(false);
    });
  });

  it('should send a decision with proceed=true', () => {
    service.sendDecision('corr-1', 'booking');
    expect(connectionService.send).toHaveBeenCalledWith({
      type: NAVIGATION_DECISION_MESSAGE_TYPE,
      version: '1.0',
      correlationId: 'corr-1',
      proceed: true
    }, { to: 'booking' });
  });

  it('should resolve the pending request to false on destroy', async () => {
    const promise = service.requestNavigation();
    service.ngOnDestroy();
    await expect(promise).resolves.toBe(false);
    expect(producerManager.unregister).toHaveBeenCalledWith(service);
  });

  it('should log an error when a peer reports an error', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- minimal payload sufficient for the test
    service.handleError({} as any);
    expect(logger.error).toHaveBeenCalled();
  });
});
