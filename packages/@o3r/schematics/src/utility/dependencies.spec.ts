import {
  enforceTildeRange,
} from './dependencies';

describe('enforceTildeRange', () => {
  test('should change caret range', () => {
    expect(enforceTildeRange('^1.2.3')).toBe('~1.2.3');
  });

  test('should change caret handle undefined', () => {
    expect(enforceTildeRange()).not.toBeDefined();
  });

  test('should not change pint range', () => {
    expect(enforceTildeRange('1.2.3')).toBe('1.2.3');
  });

  test('should change multi caret range', () => {
    expect(enforceTildeRange('^1.2.3 | 1.0.0 | ^1.1.0')).toBe('~1.2.3 | 1.0.0 | ~1.1.0');
  });
});
