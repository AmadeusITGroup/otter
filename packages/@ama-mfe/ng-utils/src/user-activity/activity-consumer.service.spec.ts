import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityMessageV1_0,
} from '@ama-mfe/messages';
import type {
  RoutedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ActivityConsumerService,
} from './activity-consumer.service';
import {
  ConsumerManagerService,
} from '@ama-mfe/ng-utils';

describe('ActivityConsumerService', () => {
  let service: ActivityConsumerService;
  let consumerManagerServiceMock: jest.Mocked<ConsumerManagerService>;

  beforeEach(() => {
    consumerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    } as unknown as jest.Mocked<ConsumerManagerService>;

    TestBed.configureTestingModule({
      providers: [
        ActivityConsumerService,
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock }
      ]
    });

    service = TestBed.inject(ActivityConsumerService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
      expect(service instanceof ActivityConsumerService).toBe(true);
    });

    it('should have the correct message type', () => {
      expect(service.type).toBe(USER_ACTIVITY_MESSAGE_TYPE);
    });

    it('should have supported version 1.0', () => {
      expect(service.supportedVersions['1.0']).toBeDefined();
      expect(typeof service.supportedVersions['1.0']).toBe('function');
    });

    it('should have undefined latestReceivedActivity initially', () => {
      expect(service.latestReceivedActivity()).toBeUndefined();
    });
  });

  describe('start', () => {
    it('should register with consumer manager service', () => {
      service.start();

      expect(consumerManagerServiceMock.register).toHaveBeenCalledWith(service);
      expect(consumerManagerServiceMock.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should unregister from consumer manager service', () => {
      service.stop();

      expect(consumerManagerServiceMock.unregister).toHaveBeenCalledWith(service);
      expect(consumerManagerServiceMock.unregister).toHaveBeenCalledTimes(1);
    });
  });

  describe('supportedVersions["1.0"]', () => {
    it('should update latestReceivedActivity signal with message data', () => {
      const mockMessage: RoutedMessage<UserActivityMessageV1_0> = {
        from: 'test-channel-id',
        to: ['consumer'],
        payload: {
          type: USER_ACTIVITY_MESSAGE_TYPE,
          version: '1.0',
          eventType: 'click',
          timestamp: 1_234_567_890
        }
      };

      service.supportedVersions['1.0'](mockMessage);

      const activity = service.latestReceivedActivity();
      expect(activity).toBeDefined();
      expect(activity?.channelId).toBe('test-channel-id');
      expect(activity?.eventType).toBe('click');
      expect(activity?.timestamp).toBe(1_234_567_890);
    });

    it('should use "unknown" as channelId when from is undefined', () => {
      const mockMessage: RoutedMessage<UserActivityMessageV1_0> = {
        from: undefined,
        to: ['consumer'],
        payload: {
          type: USER_ACTIVITY_MESSAGE_TYPE,
          version: '1.0',
          eventType: 'keydown',
          timestamp: 9_876_543_210
        }
      };

      service.supportedVersions['1.0'](mockMessage);

      const activity = service.latestReceivedActivity();
      expect(activity?.channelId).toBe('unknown');
    });

    it('should update latestReceivedActivity on subsequent messages', () => {
      const firstMessage: RoutedMessage<UserActivityMessageV1_0> = {
        from: 'channel-1',
        to: ['consumer'],
        payload: {
          type: USER_ACTIVITY_MESSAGE_TYPE,
          version: '1.0',
          eventType: 'click',
          timestamp: 1000
        }
      };

      const secondMessage: RoutedMessage<UserActivityMessageV1_0> = {
        from: 'channel-2',
        to: ['consumer'],
        payload: {
          type: USER_ACTIVITY_MESSAGE_TYPE,
          version: '1.0',
          eventType: 'scroll',
          timestamp: 2000
        }
      };

      service.supportedVersions['1.0'](firstMessage);
      expect(service.latestReceivedActivity()?.channelId).toBe('channel-1');
      expect(service.latestReceivedActivity()?.eventType).toBe('click');

      service.supportedVersions['1.0'](secondMessage);
      expect(service.latestReceivedActivity()?.channelId).toBe('channel-2');
      expect(service.latestReceivedActivity()?.eventType).toBe('scroll');
      expect(service.latestReceivedActivity()?.timestamp).toBe(2000);
    });

    it('should handle all event types', () => {
      const eventTypes = ['click', 'keydown', 'scroll', 'touchstart', 'focus', 'visibilitychange'] as const;

      eventTypes.forEach((eventType) => {
        const mockMessage: RoutedMessage<UserActivityMessageV1_0> = {
          from: 'test-channel',
          to: ['consumer'],
          payload: {
            type: USER_ACTIVITY_MESSAGE_TYPE,
            version: '1.0',
            eventType,
            timestamp: Date.now()
          }
        };

        service.supportedVersions['1.0'](mockMessage);
        expect(service.latestReceivedActivity()?.eventType).toBe(eventType);
      });
    });
  });

  describe('latestReceivedActivity signal', () => {
    it('should be read-only', () => {
      // The signal should be a readonly signal (no set method exposed)
      expect(service.latestReceivedActivity).toBeDefined();
      expect(typeof service.latestReceivedActivity).toBe('function');
      // Verify it's not a WritableSignal by checking it doesn't have set/update methods
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- testing signal type
      expect((service.latestReceivedActivity as any).set).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- testing signal type
      expect((service.latestReceivedActivity as any).update).toBeUndefined();
    });
  });
});
