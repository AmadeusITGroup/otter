import {
  NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
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
  NavigationBlockStateProducerService,
} from './navigation-block-state-producer.service';
import {
  NavigationBlockService,
} from './navigation-block.service';

describe('NavigationBlockStateProducerService', () => {
  let connectionService: { send: jest.Mock };
  let producerManager: { register: jest.Mock; unregister: jest.Mock };
  let logger: { error: jest.Mock };
  let state: NavigationBlockService;
  let service: NavigationBlockStateProducerService;

  beforeEach(() => {
    connectionService = { send: jest.fn() };
    producerManager = { register: jest.fn(), unregister: jest.fn() };
    logger = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConnectionService, useValue: connectionService },
        { provide: ProducerManagerService, useValue: producerManager },
        { provide: LoggerService, useValue: logger },
        NavigationBlockService,
        NavigationBlockStateProducerService
      ]
    });
    state = TestBed.inject(NavigationBlockService);
    service = TestBed.inject(NavigationBlockStateProducerService);
    TestBed.tick();
  });

  it('should declare the navigation-block message type and auto-register', () => {
    expect(service.types).toBe(NAVIGATION_BLOCK_STATE_MESSAGE_TYPE);
    expect(producerManager.register).toHaveBeenCalledWith(service);
  });

  it('should broadcast the initial unblocked state', () => {
    expect(connectionService.send).toHaveBeenCalledWith({
      type: NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
      version: '1.0',
      blocked: false,
      reason: undefined
    });
  });

  it('should broadcast a new message every time the state changes', () => {
    connectionService.send.mockClear();
    state.block('dirty');
    TestBed.tick();
    expect(connectionService.send).toHaveBeenLastCalledWith({
      type: NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
      version: '1.0',
      blocked: true,
      reason: 'dirty'
    });
  });

  it('should log an error when a peer reports an error', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- minimal payload sufficient for the test
    service.handleError({} as any);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should unregister on destroy', () => {
    TestBed.resetTestingModule();
    expect(producerManager.unregister).toHaveBeenCalledWith(service);
  });
});
