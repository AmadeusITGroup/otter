import {
  USER_ACTIVITY_MESSAGE_TYPE,
} from '@ama-mfe/messages';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
} from '@angular/core';
import {
  TestBed,
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
import {
  IframeActivityTrackerService,
} from './iframe-activity-tracker.service';
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
  let documentListeners: jest.SpiedFunction<Document['addEventListener']>;

  const notifyInput = (event: Event) => {
    const trusted = new Proxy(event, {
      get: (target, key): unknown => key === 'isTrusted' ? true : Reflect.get(target, key, target)
    });
    const listener = [...documentListeners.mock.calls].reverse().find(([type]) => type === event.type)?.[1];
    if (typeof listener === 'function') {
      listener.call(document, trusted);
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
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
    documentListeners = jest.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    // Clean up any event listeners
    service?.stop();
    documentListeners.mockRestore();
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

    it('should start with default config when no config is provided', () => {
      service.start();
      afterNextRenderCallback?.();

      // First event should send
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second event should not send (default throttle is 1000ms)
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // After default throttle window passes, it should send again
      jest.advanceTimersByTime(1000);
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    });

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

      expect(addEventListenerSpy).toHaveBeenCalledTimes(11);
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

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(11);
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

    it('should send message on click event', () => {
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

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
    });

    it('should update localActivity signal on activity', () => {
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      const activity = service.localActivity();
      expect(activity).toBeDefined();
      expect(activity?.channelId).toBe('local');
      expect(activity?.eventType).toBe('click');
      expect(activity?.timestamp).toBeGreaterThan(0);
    });

    it('should throttle messages', () => {
      // First event should send
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second event within throttle window should not send
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(50);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Event after throttle window should send
      jest.advanceTimersByTime(100);
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    });

    it('should always update localActivity signal even when throttled', () => {
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);
      const firstTimestamp = service.localActivity()?.timestamp;

      jest.advanceTimersByTime(50);
      notifyInput(new Event('keydown'));
      jest.advanceTimersByTime(0);

      // localActivity should be updated even though message was throttled
      expect(service.localActivity()?.eventType).toBe('keydown');
      expect(service.localActivity()?.timestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });

    it('should handle keydown events', () => {
      notifyInput(new Event('keydown'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'keydown'
        }),
        { to: ['host-app'] }
      );
    });

    it('should ignore repeated keydown events', () => {
      const repeatedKeydownEvent = new KeyboardEvent('keydown', { repeat: true });

      notifyInput(repeatedKeydownEvent);
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).not.toHaveBeenCalled();
    });

    it('should handle scroll events with throttling', () => {
      notifyInput(new Event('keydown'));
      jest.advanceTimersByTime(300);
      connectionServiceMock.send.mockClear();
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(300); // Wait for throttle interval (default 300ms)

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'scroll'
        }),
        { to: ['host-app'] }
      );
    });

    it('should throttle high-frequency scroll events', () => {
      notifyInput(new Event('keydown'));
      jest.advanceTimersByTime(300);
      connectionServiceMock.send.mockClear();
      // First scroll event should send immediately
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Second scroll within throttle window (300ms) should not send
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(100);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // Third scroll still within throttle window should not send
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(100);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);

      // After throttle window passes, next scroll should send
      jest.advanceTimersByTime(200); // Total 400ms since first event
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(0);
      expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
    });

    it('should handle touchstart events', () => {
      notifyInput(new Event('touchstart'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'touchstart'
        }),
        { to: ['host-app'] }
      );
    });

    it('should handle focus events', () => {
      document.dispatchEvent(new Event('focus'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'focus'
        }),
        { to: ['host-app'] }
      );
    });

    it('should handle visibilitychange when document becomes visible', () => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });

      document.dispatchEvent(new Event('visibilitychange'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'visibilitychange'
        }),
        { to: ['host-app'] }
      );
    });
  });

  describe('peer filtering', () => {
    it('should not send message when no peers have registered for user activity', () => {
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

      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      expect(localConnectionMock.send).not.toHaveBeenCalled();
      localService.stop();
    });

    it('should not send message when only self has registered for user activity', () => {
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

      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      expect(localConnectionMock.send).not.toHaveBeenCalled();
      localService.stop();
    });

    it('should send to multiple peers that have registered for user activity', () => {
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

      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      expect(localConnectionMock.send).toHaveBeenCalled();
      const callArgs = localConnectionMock.send.mock.calls[0][1] as { to: string[] };
      expect(callArgs.to).toContain('host-app');
      expect(callArgs.to).toContain('other-module');
      expect(callArgs.to).not.toContain('test-module');
      localService.stop();
    });
  });

  describe('shouldBroadcast filter', () => {
    it('should not send message when shouldBroadcast returns false', () => {
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: () => false
      };

      service.start(config);
      afterNextRenderCallback?.();

      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).not.toHaveBeenCalled();
    });

    it('should send message when shouldBroadcast returns true', () => {
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: () => true
      };

      service.start(config);
      afterNextRenderCallback?.();

      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      expect(connectionServiceMock.send).toHaveBeenCalled();
    });

    it('should pass event to shouldBroadcast filter', () => {
      const shouldBroadcastMock = jest.fn().mockReturnValue(true);
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        shouldBroadcast: shouldBroadcastMock
      };

      service.start(config);
      afterNextRenderCallback?.();

      const clickEvent = new Event('click');
      notifyInput(clickEvent);
      jest.advanceTimersByTime(0);

      expect(shouldBroadcastMock).toHaveBeenCalledWith(expect.any(Event));
    });

    it('should throttle shouldBroadcast calls for high-frequency events to avoid performance issues', () => {
      const shouldBroadcastMock = jest.fn().mockReturnValue(true);
      const config: ActivityProducerConfig = {
        throttleMs: 100,
        highFrequencyThrottleMs: 300,
        shouldBroadcast: shouldBroadcastMock
      };

      service.start(config);
      afterNextRenderCallback?.();
      notifyInput(new Event('keydown'));
      jest.advanceTimersByTime(300);
      shouldBroadcastMock.mockClear();

      // Dispatch many scroll events rapidly (high-frequency event)
      for (let i = 0; i < 10; i++) {
        notifyInput(new Event('scroll'));
        jest.advanceTimersByTime(10); // 10ms between each event
      }

      expect(shouldBroadcastMock).toHaveBeenCalledTimes(1);

      // After throttle window passes, next scroll should call shouldBroadcast again
      jest.advanceTimersByTime(300);
      notifyInput(new Event('scroll'));
      jest.advanceTimersByTime(0);

      expect(shouldBroadcastMock).toHaveBeenCalledTimes(2);
    });

    it('should call shouldBroadcast on every non-high-frequency event', () => {
      const shouldBroadcastMock = jest.fn().mockReturnValue(true);
      const config: ActivityProducerConfig = {
        throttleMs: 1000,
        shouldBroadcast: shouldBroadcastMock
      };

      service.start(config);
      afterNextRenderCallback?.();

      // Dispatch multiple click events (not a high-frequency event)
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(10);
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(10);
      notifyInput(new Event('click'));
      jest.advanceTimersByTime(0);

      // shouldBroadcast should be called for each click event
      expect(shouldBroadcastMock).toHaveBeenCalledTimes(3);
    });
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

    describe('genuine interaction tracking', () => {
      let listeners: jest.SpiedFunction<Document['addEventListener']>;

      const notify = notifyInput;

      beforeEach(() => {
        jest.setSystemTime(10_000);
        listeners = jest.spyOn(document, 'addEventListener');
        service.start({ trackNestedIframes: false });
        afterNextRenderCallback?.();
      });

      afterEach(() => {
        listeners.mockRestore();
      });

      it('ignores synthetic input and leaves iframe polling disabled by default', () => {
        document.dispatchEvent(new MouseEvent('click'));
        document.dispatchEvent(new KeyboardEvent('keydown'));
        document.dispatchEvent(new WheelEvent('wheel'));
        expect(connectionServiceMock.send).not.toHaveBeenCalled();
        const iframe = document.createElement('iframe');
        document.body.append(iframe);
        iframe.focus();
        jest.advanceTimersByTime(60_000);
        expect(service.localActivity()?.eventType).not.toBe('iframeinteraction');
        expect(connectionServiceMock.send).not.toHaveBeenCalledWith(
          expect.objectContaining({ eventType: 'iframeinteraction' }), expect.anything()
        );
        iframe.remove();
      });

      it('honors explicit iframe focus tracking', () => {
        service.stop();
        const startTracker = jest.spyOn(TestBed.inject(IframeActivityTrackerService), 'start').mockImplementation(() => {});
        service.start({ trackNestedIframes: true });
        afterNextRenderCallback?.();

        expect(startTracker).toHaveBeenCalledTimes(1);
        startTracker.mock.calls[0][0].onActivity();
        expect(service.localActivity()?.eventType).toBe('iframeinteraction');
        expect(connectionServiceMock.send).toHaveBeenCalledWith(
          expect.objectContaining({ eventType: 'iframeinteraction' }), { to: ['host-app'] }
        );
        startTracker.mockRestore();
      });

      it.each([
        ['click', 'click'],
        ['keydown', 'keydown'],
        ['wheel', 'scroll'],
        ['pointerdown', 'click'],
        ['touchstart', 'touchstart'],
        ['touchmove', 'touchstart']
      ])('reports trusted %s using the existing %s protocol category', (domEvent, eventType) => {
        notify(new Event(domEvent));
        expect(service.localActivity()).toEqual({ channelId: 'local', eventType, timestamp: 10_000 });
        expect(connectionServiceMock.send).toHaveBeenCalledWith(
          expect.objectContaining({ eventType, timestamp: 10_000 }), { to: ['host-app'] }
        );
      });

      it.each(['focus', 'visibilitychange'])('counts %s as activity and preserves broadcast throttling', (eventType) => {
        notify(new Event(eventType));
        notify(new MouseEvent('click'));
        notify(new MouseEvent('click'));
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);
        expect(connectionServiceMock.send).toHaveBeenNthCalledWith(1, expect.objectContaining({ eventType }), { to: ['host-app'] });
        expect(service.localActivity()?.eventType).toBe('click');
        jest.advanceTimersByTime(1000);
        notify(new MouseEvent('click'));
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
        expect(connectionServiceMock.send).toHaveBeenNthCalledWith(2, expect.objectContaining({ eventType: 'click' }), { to: ['host-app'] });
      });

      it('records focus and visibility notifications after input', () => {
        notify(new MouseEvent('click'));
        notify(new FocusEvent('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        expect(service.localActivity()?.eventType).toBe('visibilitychange');
      });

      it('does not qualify scrolling from focus or visibility notifications', () => {
        notify(new FocusEvent('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        notify(new Event('scroll'));
        expect(service.localActivity()?.eventType).toBe('visibilitychange');
      });

      it('requires recent input for scrolling and does not extend the window with scrolling', () => {
        notify(new Event('scroll'));
        expect(service.localActivity()).toBeUndefined();
        jest.advanceTimersByTime(300);
        notify(new WheelEvent('wheel'));
        jest.advanceTimersByTime(500);
        notify(new Event('scroll'));
        expect(service.localActivity()?.timestamp).toBe(10_800);
        jest.advanceTimersByTime(500);
        notify(new Event('scroll'));
        expect(service.localActivity()?.timestamp).toBe(10_800);
      });

      it('updates local activity for input inside the broadcast throttle window', () => {
        notify(new KeyboardEvent('keydown'));
        jest.advanceTimersByTime(10);
        notify(new Event('scroll'));
        expect(service.localActivity()?.timestamp).toBe(10_010);
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);
      });

      it.each(['pointerup', 'pointercancel', 'visibilitychange', 'blur'])('tracks sustained scrollbar dragging until %s', (releaseEvent) => {
        const scroller = document.createElement('div');
        Object.defineProperties(scroller, {
          offsetWidth: { value: 300 },
          offsetHeight: { value: 200 },
          clientWidth: { value: 284 },
          clientHeight: { value: 200 },
          scrollHeight: { value: 2000 }
        });
        jest.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 300, 200));
        const down = new MouseEvent('pointerdown', { clientX: 392, clientY: 110 });
        Object.defineProperty(down, 'target', { value: scroller });
        notify(down);
        jest.advanceTimersByTime(2000);
        const scroll = new Event('scroll');
        Object.defineProperty(scroll, 'target', { value: scroller });
        notify(scroll);
        expect(service.localActivity()?.timestamp).toBe(12_000);
        if (releaseEvent === 'blur') {
          window.dispatchEvent(new Event('blur'));
        } else {
          notify(new Event(releaseEvent));
        }
        jest.advanceTimersByTime(1000);
        notify(scroll);
        expect(service.localActivity()?.timestamp).toBe(12_000);
      });

      it.each([
        [0.5, 0.5, 292, 50, true],
        [2, 2, 292, 50, true],
        [0.5, 2, 50, 192, true],
        [2, 0.5, 50, 192, true],
        [0.5, 0.5, 150, 100, false],
        [2, 2, 150, 100, false],
        [0.5, 0.5, 310, 50, false]
      ] as const)('detects scaled scrollbar input at scale (%s, %s), layout position (%s, %s): %s', (scaleX, scaleY, x, y, scrollbar) => {
        const scroller = document.createElement('div');
        Object.defineProperties(scroller, {
          offsetWidth: { value: 300 },
          offsetHeight: { value: 200 },
          clientWidth: { value: 284 },
          clientHeight: { value: 184 },
          scrollWidth: { value: 2000 },
          scrollHeight: { value: 2000 }
        });
        jest.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 300 * scaleX, 200 * scaleY));
        const down = new MouseEvent('pointerdown', { clientX: 100 + x * scaleX, clientY: 100 + y * scaleY });
        Object.defineProperty(down, 'target', { value: scroller });
        notify(down);
        jest.advanceTimersByTime(2000);
        const scroll = new Event('scroll');
        Object.defineProperty(scroll, 'target', { value: scroller });
        notify(scroll);
        expect(service.localActivity()?.timestamp).toBe(scrollbar ? 12_000 : 10_000);
      });

      it('honors custom filters without qualifying later scrolling from rejected input', () => {
        service.stop();
        listeners.mockClear();
        service.start({ shouldBroadcast: (event) => event.type !== 'click' });
        afterNextRenderCallback?.();
        notify(new MouseEvent('click'));
        notify(new Event('scroll'));
        expect(service.localActivity()).toBeUndefined();
        expect(connectionServiceMock.send).not.toHaveBeenCalled();
      });

      it('ignores repeated keydown without qualifying later scrolling', () => {
        notify(new KeyboardEvent('keydown', { repeat: true }));
        notify(new Event('scroll'));
        expect(service.localActivity()).toBeUndefined();
      });

      it('reports every SDK interaction without consuming or bypassing DOM throttling', () => {
        service.reportIframeInteraction();
        service.reportIframeInteraction();
        notify(new MouseEvent('click'));
        notify(new MouseEvent('click'));
        service.reportIframeInteraction();
        for (const [index, eventType] of ['iframeinteraction', 'iframeinteraction', 'click', 'iframeinteraction'].entries()) {
          expect(connectionServiceMock.send).toHaveBeenNthCalledWith(index + 1, expect.objectContaining({ eventType }), { to: ['host-app'] });
        }
        expect(service.localActivity()).toEqual({ channelId: 'local', eventType: 'iframeinteraction', timestamp: 10_000 });
        service.stop();
        service.reportIframeInteraction();
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(4);
      });
    });

    describe('restart lifecycle', () => {
      it('cancels pending setup when stopped before rendering', () => {
        service.start();
        service.stop();
        afterNextRenderCallback?.();
        notifyInput(new Event('click'));
        expect(connectionServiceMock.send).not.toHaveBeenCalled();
      });

      it('ignores old setup callbacks after restarting and resets broadcast throttling', () => {
        service.start();
        const oldCallback = afterNextRenderCallback;
        service.stop();
        service.start();
        oldCallback?.();
        afterNextRenderCallback?.();
        notifyInput(new Event('click'));
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(1);
        service.stop();
        service.start();
        afterNextRenderCallback?.();
        notifyInput(new Event('click'));
        expect(connectionServiceMock.send).toHaveBeenCalledTimes(2);
      });

      it('records explicit reports locally without interested peers', () => {
        connectionServiceMock.knownPeers.clear();
        service.reportIframeInteraction();
        expect(service.localActivity()).toBeUndefined();
        service.start();
        service.reportIframeInteraction();
        expect(service.localActivity()?.eventType).toBe('iframeinteraction');
        expect(connectionServiceMock.send).not.toHaveBeenCalled();
      });
    });
  });
});
