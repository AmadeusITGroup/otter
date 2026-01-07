import {
  TestBed,
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
    jest.useFakeTimers();
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
    jest.useRealTimers();
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
    it('should not start twice', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // First poll detects focus and emits immediately
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval emits again
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    });

    it('should use default poll interval when not specified', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.nestedIframePollIntervalMs).toBe(1000);
    });

    it('should use custom poll interval', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: 500,
        activityIntervalMs: TEST_ACTIVITY_INTERVAL
      });

      // Poll at 500ms detects focus
      jest.advanceTimersByTime(500);
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    });

    it('should use custom activity interval', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: TEST_POLL_INTERVAL,
        activityIntervalMs: 2000
      });

      // Poll detects focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval at 2000ms
      jest.advanceTimersByTime(2000);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(2000);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('stop', () => {
    it('should not throw when stopping without starting', () => {
      expect(() => service.stop()).not.toThrow();
    });

    it('should stop all intervals after stop', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({
        onActivity: onActivityMock,
        pollIntervalMs: TEST_POLL_INTERVAL,
        activityIntervalMs: TEST_ACTIVITY_INTERVAL
      });

      // Poll detects focus and emits
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      service.stop();

      jest.advanceTimersByTime(5000);
      // Should still be 1 - no more calls after stop
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    });

    it('should allow restart after stop', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      service.stop();

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('polling behavior', () => {
    it('should emit immediately when poll detects iframe focus', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // First poll detects focus and emits immediately
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval emits again
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    });

    it('should not emit activity when iframe does not have focus', () => {
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // activeElement is body, not iframe
      jest.advanceTimersByTime(3000);
      expect(onActivityMock).not.toHaveBeenCalled();
    });

    it('should stop emitting when focus leaves iframe', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Focus leaves iframe
      setActiveElementToBody();

      // Next poll detects focus loss and stops activity interval
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);

      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      // Should still be 2 - no more calls after focus left
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    });

    it('should resume emitting when focus returns to iframe', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Focus leaves iframe
      setActiveElementToBody();
      jest.advanceTimersByTime(TEST_POLL_INTERVAL); // Poll detects loss
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Focus returns to iframe
      setActiveElementToIframe(iframe);
      jest.advanceTimersByTime(TEST_POLL_INTERVAL); // Poll detects focus again, emits immediately
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Activity interval continues
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    });

    it('should detect any iframe (including dynamically added)', () => {
      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // No iframe focus on start
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).not.toHaveBeenCalled();

      // Create a new iframe after start and focus it
      const dynamicIframe = document.createElement('iframe');
      document.body.append(dynamicIframe);
      setActiveElementToIframe(dynamicIframe);

      // Next poll detects focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('visibility behavior', () => {
    // Helper to simulate visibility change
    const setDocumentVisibility = (state: 'visible' | 'hidden') => {
      Object.defineProperty(document, 'visibilityState', {
        value: state,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    };

    afterEach(() => {
      // Reset visibility to visible
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true
      });
    });

    it('should not start polling when document is hidden', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      // Set document as hidden before starting
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true
      });

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Even with iframe focused, no activity should be emitted when hidden
      jest.advanceTimersByTime(TEST_POLL_INTERVAL * 10);
      expect(onActivityMock).not.toHaveBeenCalled();
    });

    it('should stop emitting activity when tab becomes hidden', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus and emits
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Activity interval emits
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Tab becomes hidden
      setDocumentVisibility('hidden');

      // No more activity should be emitted
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL * 5);
      expect(onActivityMock).toHaveBeenCalledTimes(2);
    });

    it('should resume emitting activity when tab becomes visible again', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);
      setActiveElementToIframe(iframe);

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Poll detects focus and emits
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Tab becomes hidden
      setDocumentVisibility('hidden');
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL * 2);
      expect(onActivityMock).toHaveBeenCalledTimes(1);

      // Tab becomes visible again
      setDocumentVisibility('visible');

      // Polling resumes and detects iframe focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(2);

      // Activity interval continues
      jest.advanceTimersByTime(TEST_ACTIVITY_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(3);
    });

    it('should not emit activity when tab is hidden even if iframe has focus', () => {
      const iframe = document.createElement('iframe');
      document.body.append(iframe);

      // Start with document hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true
      });

      service.start({ onActivity: onActivityMock, pollIntervalMs: TEST_POLL_INTERVAL, activityIntervalMs: TEST_ACTIVITY_INTERVAL });

      // Focus iframe while hidden
      setActiveElementToIframe(iframe);
      jest.advanceTimersByTime(TEST_POLL_INTERVAL * 5);

      // No activity emitted while hidden
      expect(onActivityMock).not.toHaveBeenCalled();

      // Tab becomes visible
      setDocumentVisibility('visible');

      // Now polling starts and detects iframe focus
      jest.advanceTimersByTime(TEST_POLL_INTERVAL);
      expect(onActivityMock).toHaveBeenCalledTimes(1);
    });
  });
});
