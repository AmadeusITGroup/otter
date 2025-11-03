import {
  isPerformanceNavigationEntry,
} from './event-track-helpers';

describe('isPerformanceNavigationEntry', () => {
  test('should return true if entry is navigation', () => {
    const performanceEntry: PerformanceEntry = {
      duration: 0,
      name: '',
      startTime: 0,
      entryType: 'navigation',
      toJSON: () => ({})
    };

    expect(isPerformanceNavigationEntry(performanceEntry)).toEqual(true);
  });

  test('should return false if entry is anything else', () => {
    const performanceEntry: PerformanceEntry = {
      duration: 0,
      name: '',
      startTime: 0,
      entryType: 'resource',
      toJSON: () => ({})
    };

    expect(isPerformanceNavigationEntry(performanceEntry)).toEqual(false);
  });
});
