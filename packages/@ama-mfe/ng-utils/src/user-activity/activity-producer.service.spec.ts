import {
  USER_ACTIVITY_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
} from '@angular/core';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConnectionService,
} from '../connect';
import {
  registerProducer,
} from '../managers';
import {
  ActivityProducerService,
} from './activity-producer.service';
import type {
  ActivityProducerConfig,
} from './interfaces';

let afterNextRenderCallback: (() => void) | null = null;

jest.mock('../managers', () => ({
  ...jest.requireActual('../managers'),
  registerProducer: jest.fn()
}));

// Mock afterNextRender at module level
jest.mock('@angular/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- mocking the module
  const actual = jest.requireActual('@angular/core');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- mocking the module
  return {
    ...actual,
    afterNextRender: jest.fn((callback: () => void) => {
      afterNextRenderCallback = callback;
    })
  };
});

describe('ActivityProducerService', () => {
  let service: ActivityProducerService;
  let connectionServiceMock: jest.Mocked<ConnectionService<any>>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeEach(() => {
    afterNextRenderCallback = null;

    connectionServiceMock = {
      send: jest.fn(),
      id: 'test-module',
      knownPeers: new Map([
        ['host-app', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]],
        ['test-module', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]]
      ])
    } as unknown as jest.Mocked<ConnectionService<any>>;

    loggerServiceMock = {
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;

    TestBed.configureTestingModule({
      providers: [
        ActivityProducerService,
        { provide: ConnectionService, useValue: connectionServiceMock },
        { provide: LoggerService, useValue: loggerServiceMock }
      ]
    });

    service = TestBed.inject(ActivityProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up any event listeners
    service?.stop();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
      expect(service instanceof ActivityProducerService).toBe(true);
    });

    it('should have the correct message type', () => {
      expect(service.types).toBe(USER_ACTIVITY_MESSAGE_TYPE);
    });

    it('should register as a producer on construction', () => {
      expect(registerProducer).toHaveBeenCalledWith(service);
    });

    it('should call stop when the injector is destroyed', () => {
      const parentInjector = TestBed.inject(EnvironmentInjector);
      const childInjector = createEnvironmentInjector([
        ActivityProducerService,
        { provide: ConnectionService, useValue: connectionServiceMock }
      ], parentInjector);

      const childService = childInjector.get(ActivityProducerService);
      const stopSpy = jest.spyOn(childService, 'stop');

      childInjector.destroy();

      expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    it('should have undefined localActivity initially', () => {
      expect(service.localActivity()).toBeUndefined();
    });
  });

  describe('handleError', () => {
    it('should log warning for error messages', () => {
      const errorContent = {
        type: USER_ACTIVITY_MESSAGE_TYPE,
        version: '1.0',
        error: 'Test error'
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- test mock
      service.handleError(errorContent as any);

      expect(loggerServiceMock.error).toHaveBeenCalledWith('Error in user activity service message', errorContent);
    });
  });

  describe('start', () => {
    const config: ActivityProducerConfig = {
      throttleMs: 100
    };

    it('should start with default config when no config is provided', fakeAsync(() => {
      service.start();
      afterNextRenderCallback?.();

      // First event should send
      document.dispatchEvent(new Event('click'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second event should not send (default throttle is 1000ms)
      document.dispatchEvent(new Event('click'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // After default throttle window passes, it should send again
      tick(1000);
      document.dispatchEvent(new Event('click'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    }));

    it('should not start twice', () => {
      service.start(config);
      const firstCallback = afterNextRenderCallback;

      service.start(config);

      // afterNextRender should only be called once
      expect(afterNextRenderCallback).toBe(firstCallback);
    });

    it('should schedule event listener setup via afterNextRender', () => {
      service.start(config);

      expect(afterNextRenderCallback).not.toBeNull();
    });

    it('should add event listeners when afterNextRender callback executes', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      service.start(config);
      afterNextRenderCallback?.();

      // Should add listeners for: click, keydown, scroll, touchstart, focus, visibilitychange
      expect(addEventListenerSpy).toHaveBeenCalledTimes(6);
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), { passive: true, capture: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), { passive: true, capture: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true, capture: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true, capture: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function), { passive: true, capture: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function), { passive: true, capture: true });

      addEventListenerSpy.mockRestore();
    });
  });

  describe('stop', () => {
    const config: ActivityProducerConfig = {
      throttleMs: 100
    };

    it('should remove all event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      service.start(config);
      afterNextRenderCallback?.();
      service.stop();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(6);
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('activity detection', () => {
    const config: ActivityProducerConfig = {
      throttleMs: 100
    };

    beforeEach(() => {
      service.start(config);
      afterNextRenderCallback?.();
    });

    it('should send message on click event', fakeAsync(() => {
      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: USER_ACTIVITY_MESSAGE_TYPE,
          version: '1.0',
          eventType: 'click',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest matcher
          timestamp: expect.any(Number)
        }),
        { to: ['host-app'] }
      );
    }));

    it('should update localActivity signal on activity', fakeAsync(() => {
      document.dispatchEvent(new Event('click'));
      tick(0);

      const activity = service.localActivity();
      expect(activity).toBeDefined();
      expect(activity?.channelId).toBe('local');
      expect(activity?.eventType).toBe('click');
      expect(activity?.timestamp).toBeGreaterThan(0);
    }));

    it('should throttle messages', fakeAsync(() => {
      // First event should send
      document.dispatchEvent(new Event('click'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second event within throttle window should not send
      document.dispatchEvent(new Event('click'));
      tick(50);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Event after throttle window should send
      tick(100);
      document.dispatchEvent(new Event('click'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    }));

    it('should always update localActivity signal even when throttled', fakeAsync(() => {
      document.dispatchEvent(new Event('click'));
      tick(0);
      const firstTimestamp = service.localActivity()?.timestamp;

      tick(50);
      document.dispatchEvent(new Event('keydown'));
      tick(0);

      // localActivity should be updated even though message was throttled
      expect(service.localActivity()?.eventType).toBe('keydown');
      expect(service.localActivity()?.timestamp).toBeGreaterThanOrEqual(firstTimestamp);
    }));

    it('should handle keydown events', fakeAsync(() => {
      document.dispatchEvent(new Event('keydown'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'keydown'
        }),
        { to: ['host-app'] }
      );
    }));

    it('should ignore repeated keydown events', fakeAsync(() => {
      const repeatedKeydownEvent = new KeyboardEvent('keydown', { repeat: true });

      document.dispatchEvent(repeatedKeydownEvent);
      tick(0);

      expect(connectionServiceMock.send).not.toHaveBeenCalled();
    }));

    it('should handle scroll events with throttling', fakeAsync(() => {
      document.dispatchEvent(new Event('scroll'));
      tick(300); // Wait for throttle interval (default 300ms)

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'scroll'
        }),
        { to: ['host-app'] }
      );
    }));

    it('should throttle high-frequency scroll events', fakeAsync(() => {
      // First scroll event should send immediately
      document.dispatchEvent(new Event('scroll'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second scroll within throttle window (300ms) should not send
      document.dispatchEvent(new Event('scroll'));
      tick(100);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Third scroll still within throttle window should not send
      document.dispatchEvent(new Event('scroll'));
      tick(100);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // After throttle window passes, next scroll should send
      tick(200); // Total 400ms since first event
      document.dispatchEvent(new Event('scroll'));
      tick(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    }));

    it('should handle touchstart events', fakeAsync(() => {
      document.dispatchEvent(new Event('touchstart'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'touchstart'
        }),
        { to: ['host-app'] }
      );
    }));

    it('should handle focus events', fakeAsync(() => {
      document.dispatchEvent(new Event('focus'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'focus'
        }),
        { to: ['host-app'] }
      );
    }));

    it('should handle visibilitychange when document becomes visible', fakeAsync(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      document.dispatchEvent(new Event('visibilitychange'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'visibilitychange'
        }),
        { to: ['host-app'] }
      );
    }));
  });

  describe('peer filtering', () => {
    it('should not send message when no peers have registered for user activity', fakeAsync(() => {
      const localConnectionMock = {
        send: jest.fn(),
        id: 'test-module',
        knownPeers: new Map([
          ['test-module', [{ type: 'other_message', version: '1.0' }]]
        ])
      } as unknown as jest.Mocked<ConnectionService<any>>;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ActivityProducerService,
          { provide: ConnectionService, useValue: localConnectionMock }
        ]
      });
      const localService = TestBed.inject(ActivityProducerService);

      localService.start({ throttleMs: 100 });
      afterNextRenderCallback?.();

      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(localConnectionMock.send).not.toHaveBeenCalled();
      localService.stop();
    }));

    it('should not send message when only self has registered for user activity', fakeAsync(() => {
      const localConnectionMock = {
        send: jest.fn(),
        id: 'test-module',
        knownPeers: new Map([
          ['test-module', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]]
        ])
      } as unknown as jest.Mocked<ConnectionService<any>>;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ActivityProducerService,
          { provide: ConnectionService, useValue: localConnectionMock }
        ]
      });
      const localService = TestBed.inject(ActivityProducerService);

      localService.start({ throttleMs: 100 });
      afterNextRenderCallback?.();

      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(localConnectionMock.send).not.toHaveBeenCalled();
      localService.stop();
    }));

    it('should send to multiple peers that have registered for user activity', fakeAsync(() => {
      const localConnectionMock = {
        send: jest.fn(),
        id: 'test-module',
        knownPeers: new Map([
          ['host-app', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]],
          ['other-module', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]],
          ['test-module', [{ type: USER_ACTIVITY_MESSAGE_TYPE, version: '1.0' }]]
        ])
      } as unknown as jest.Mocked<ConnectionService<any>>;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ActivityProducerService,
          { provide: ConnectionService, useValue: localConnectionMock }
        ]
      });
      const localService = TestBed.inject(ActivityProducerService);

      localService.start({ throttleMs: 100 });
      afterNextRenderCallback?.();

      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(localConnectionMock.send).toHaveBeenCalled();
      const callArgs = localConnectionMock.send.mock.calls[0][1] as { to: string[] };
      expect(callArgs.to).toContain('host-app');
      expect(callArgs.to).toContain('other-module');
      expect(callArgs.to).not.toContain('test-module');
      localService.stop();
    }));
  });

  describe('shouldBroadcast filter', () => {
    it('should not send message when shouldBroadcast returns false', fakeAsync(() => {
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: () => false
      };

      service.start(config);
      afterNextRenderCallback?.();

      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(connectionServiceMock.send).not.toHaveBeenCalled();
    }));

    it('should send message when shouldBroadcast returns true', fakeAsync(() => {
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: () => true
      };

      service.start(config);
      afterNextRenderCallback?.();

      document.dispatchEvent(new Event('click'));
      tick(0);

      expect(connectionServiceMock.send).toHaveBeenCalled();
    }));

    it('should pass event to shouldBroadcast filter', fakeAsync(() => {
      const shouldBroadcastMock = jest.fn().mockReturnValue(true);
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: shouldBroadcastMock
      };

      service.start(config);
      afterNextRenderCallback?.();

      const clickEvent = new Event('click');
      document.dispatchEvent(clickEvent);
      tick(0);

      expect(shouldBroadcastMock).toHaveBeenCalledWith(expect.any(Event));
    }));
  });

  describe('localActivity signal', () => {
    it('should be read-only', () => {
      expect(service.localActivity).toBeDefined();
      expect(typeof service.localActivity).toBe('function');
      // Verify it's not a WritableSignal
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- testing signal type
      expect((service.localActivity as any).set).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- testing signal type
      expect((service.localActivity as any).update).toBeUndefined();
    });
  });
});
