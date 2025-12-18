import {
  USER_ACTIVITY_MESSAGE_TYPE,
  type UserActivityMessageV1_0,
} from '@ama-mfe/messages';
import {
  isUserActivityMessage,
} from './user-activity';

describe('isUserActivityMessage', () => {
  it('should return true for valid UserActivityMessageV1_0', () => {
    const message: UserActivityMessageV1_0 = {
      type: USER_ACTIVITY_MESSAGE_TYPE,
      version: '1.0',
      eventType: 'click',
      timestamp: Date.now()
    };

    expect(isUserActivityMessage(message)).toBe(true);
  });

  it('should return true for all valid event types', () => {
    const eventTypes = ['click', 'keydown', 'scroll', 'touchstart', 'focus', 'visibilitychange', 'iframeinteraction'] as const;

    eventTypes.forEach((eventType) => {
      const message: UserActivityMessageV1_0 = {
        type: USER_ACTIVITY_MESSAGE_TYPE,
        version: '1.0',
        eventType,
        timestamp: Date.now()
      };

      expect(isUserActivityMessage(message)).toBe(true);
    });
  });

  it('should return false for null', () => {
    expect(isUserActivityMessage(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isUserActivityMessage(undefined)).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isUserActivityMessage('string')).toBe(false);
    expect(isUserActivityMessage(123)).toBe(false);
    expect(isUserActivityMessage(true)).toBe(false);
  });

  it('should return false for object without type property', () => {
    const message = {
      version: '1.0',
      eventType: 'click',
      timestamp: Date.now()
    };

    expect(isUserActivityMessage(message)).toBe(false);
  });

  it('should return false for object with wrong type', () => {
    const message = {
      type: 'wrong_type',
      version: '1.0',
      eventType: 'click',
      timestamp: Date.now()
    };

    expect(isUserActivityMessage(message)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isUserActivityMessage({})).toBe(false);
  });

  it('should return false for array', () => {
    expect(isUserActivityMessage([])).toBe(false);
  });

  it('should return true even if other properties are missing (only checks type)', () => {
    // The type guard only checks for the type property
    const message = {
      type: USER_ACTIVITY_MESSAGE_TYPE
    };

    expect(isUserActivityMessage(message)).toBe(true);
  });
});
