import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  DEFAULT_ACTIVITY_PRODUCER_CONFIG,
} from './config';
import {
  IframeActivityTrackerService,
} from './iframe-activity-tracker.service';

describe('IframeActivityTrackerService', () => {
  let service: IframeActivityTrackerService;
  let onActivityMock: jest.Mock;

  // Use a short poll interval for tests
  const TEST_POLL_INTERVAL = 100;
  const TEST_ACTIVITY_INTERVAL = 1000;

  // Helper to set activeElement to an iframe
  const setActiveElementToIframe = (iframe: HTMLIFrameElement) => {
    Object.defineProperty(document, 'activeElement', {
      value: iframe,
      configurable: true
    });
  };

  // Helper to set activeElement to body (not iframe)
  const setActiveElementToBody = () => {
    Object.defineProperty(document, 'activeElement', {
      value: document.body,
      configurable: true
    });
  };

  beforeEach(() => {
    onActivityMock = jest.fn();

    TestBed.configureTestingModule({
      providers: [IframeActivityTrackerService]
    });

    service = TestBed.inject(IframeActivityTrackerService);

    // Reset activeElement mock
    setActiveElementToBody();
  });

  afterEach(() => {
    service.stop();
    jest.clearAllMocks();
    // Clean up any iframes added during tests
    document.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
      expect(service instanceof IframeActivityTrackerService).toBe(true);
    });
  });

  describe('start', () => {
    it('should not start twice', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // First poll detects focus and emits immediately
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval emits again
      tick(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    }));

    it('should use default poll interval when not specified', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.nestedIframePollIntervalMs).toBe(1000);
    });

    it('should use custom poll interval', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: 500,
        activityIntervalMs: TEST_ACTIVITY_INTERVAL
      });

      // Poll at 500ms detects focus
      tick(500);
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    }));

    it('should use custom activity interval', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: TEST_POLL_INTERVAL,
        activityIntervalMs: 2000
      });

      // Poll detects focus
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval at 2000ms
      tick(2000);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      tick(2000);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    }));
  });

  describe('stop', () => {
    it('should not throw when stopping without starting', () => {
      expect(() => service.stop()).not.toThrow();
    });

    it('should stop all intervals after stop', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: TEST_POLL_INTERVAL,
        activityIntervalMs: TEST_ACTIVITY_INTERVAL
      });

      // Poll detects focus and emits
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      service.stop();

      tick(5000);
      // Should still be 1 - no more calls after stop
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    }));

    it('should allow restart after stop', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      service.stop();

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    }));
  });

  describe('polling behavior', () => {
    it('should emit immediately when poll detects iframe focus', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // First poll detects focus and emits immediately
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval emits again
      tick(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      tick(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    }));

    it('should not emit activity when iframe does not have focus', fakeAsync(() => {
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // activeElement is body, not iframe
      tick(3000);
      expect(onActivityMock).not.toHaveBeenCalled();
    }));

    it('should stop emitting when focus leaves iframe', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval
      tick(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Focus leaves iframe
      setActiveElementToBody();

      // Next poll detects focus loss and stops activity interval
      tick(TEST_POLL_INTERVAL);

      tick(TEST_ACTIVITY_INTERVAL);
      // Should still be 2 - no more calls after focus left
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    }));

    it('should resume emitting when focus returns to iframe', fakeAsync(() => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Focus leaves iframe
      setActiveElementToBody();
      tick(TEST_POLL_INTERVAL); // Poll detects loss
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Focus returns to iframe
      setActiveElementToIframe(iframe);
      tick(TEST_POLL_INTERVAL); // Poll detects focus again, emits immediately
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Activity interval continues
      tick(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    }));

    it('should detect any iframe (including dynamically added)', fakeAsync(() => {
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // No iframe focus on start
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).not.toHaveBeenCalled();

      // Create a new iframe after start and focus it
      const dynamicIframe = document.createElement('iframe');
      document.body.append(dynamicIframe);
      setActiveElementToIframe(dynamicIframe);

      // Next poll detects focus
      tick(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    }));
  });
});
