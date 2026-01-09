import {
  ACTIVITY_EVENTS,
  DEFAULT_ACTIVITY_PRODUCER_CONFIG,
  HIGH_FREQUENCY_EVENTS,
} from './config';

describe('user-activity config', () => {
  describe('ACTIVITY_EVENTS', () => {
    it('should contain expected event types', () => {
      expect(ACTIVITY_EVENTS).toContain('click');
      expect(ACTIVITY_EVENTS).toContain('keydown');
      expect(ACTIVITY_EVENTS).toContain('scroll');
      expect(ACTIVITY_EVENTS).toContain('touchstart');
      expect(ACTIVITY_EVENTS).toContain('focus');
    });

    it('should have 5 event types', () => {
      expect(ACTIVITY_EVENTS.length).toBe(5);
    });

    it('should be an array', () => {
      expect(Array.isArray(ACTIVITY_EVENTS)).toBe(true);
    });
  });

  describe('HIGH_FREQUENCY_EVENTS', () => {
    it('should contain scroll', () => {
      expect(HIGH_FREQUENCY_EVENTS).toContain('scroll');
    });

    it('should have 1 event type', () => {
      expect(HIGH_FREQUENCY_EVENTS.length).toBe(1);
    });

    it('should be a subset of ACTIVITY_EVENTS', () => {
      HIGH_FREQUENCY_EVENTS.forEach((event) => {
        expect(ACTIVITY_EVENTS).toContain(event);
      });
    });
  });

  describe('DEFAULT_ACTIVITY_PRODUCER_CONFIG', () => {
    it('should have throttleMs set to 1000ms', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.throttleMs).toBe(1000);
    });

    it('should have trackNestedIframes set to false', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.trackNestedIframes).toBe(false);
    });

    it('should have highFrequencyThrottleMs set to 300ms', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.highFrequencyThrottleMs).toBe(300);
    });

    it('should have nestedIframeActivityEmitIntervalMs set to 30000ms', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.nestedIframeActivityEmitIntervalMs).toBe(30_000);
    });

    it('should have nestedIframePollIntervalMs set to 1000ms', () => {
      expect(DEFAULT_ACTIVITY_PRODUCER_CONFIG.nestedIframePollIntervalMs).toBe(1000);
    });
  });
});
