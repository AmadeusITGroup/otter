import {
  NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
  type NavigationBlockStateV1_0,
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
  NavigationBlockStateConsumerService,
} from './navigation-block-state-consumer.service';

describe('NavigationBlockStateConsumerService', () => {
  let consumerManager: { register: jest.Mock; unregister: jest.Mock };
  let service: NavigationBlockStateConsumerService;

  beforeEach(() => {
    consumerManager = { register: jest.fn(), unregister: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConsumerManagerService, useValue: consumerManager },
        { provide: LoggerService, useValue: { warn: jest.fn(), error: jest.fn() } },
        NavigationBlockStateConsumerService
      ]
    });
    service = TestBed.inject(NavigationBlockStateConsumerService);
  });

  it('should declare the navigation-block message type', () => {
    expect(service.type).toBe(NAVIGATION_BLOCK_STATE_MESSAGE_TYPE);
  });

  it('should register on start', () => {
    expect(consumerManager.register).not.toHaveBeenCalled();
    service.start();
    expect(consumerManager.register).toHaveBeenCalledWith(service);
  });

  it('should expose an undefined state until a message is received', () => {
    expect(service.blockState()).toBeUndefined();
  });

  it('should capture the block state along with the originating channel', () => {
    service.supportedVersions['1.0']({
      from: 'booking',
      to: ['cockpit'],
      payload: {
        type: NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
        version: '1.0',
        blocked: true,
        reason: 'unsaved form'
      } satisfies NavigationBlockStateV1_0
    });
    expect(service.blockState()).toEqual({
      blocked: true,
      reason: 'unsaved form',
      channelId: 'booking'
    });
  });

  it('should reset the state to unblocked on clear()', () => {
    service.supportedVersions['1.0']({
      from: 'booking',
      to: ['cockpit'],
      payload: {
        type: NAVIGATION_BLOCK_STATE_MESSAGE_TYPE,
        version: '1.0',
        blocked: true
      } satisfies NavigationBlockStateV1_0
    });
    service.clear();
    expect(service.blockState()).toEqual({ blocked: false });
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
