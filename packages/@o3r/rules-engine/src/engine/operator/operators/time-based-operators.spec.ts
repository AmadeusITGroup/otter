import {
  executeOperator,
} from '../operator-helpers';
import {
  inRangeTime,
} from './time-based-operators';

describe('Operators', () => {
  let range: [string, string];

  beforeEach(() => {
    range = ['00:00', '06:00'];
  });

  describe('inRangeTime', () => {
    it('should have a valid name', () => {
      expect(inRangeTime.name).toBe('inRangeTime');
    });

    it('should be invalid when times are invalid', () => {
      expect(() => executeOperator('invalid time' as any, range, inRangeTime)).toThrow();
      expect(() => executeOperator(null as any, range, inRangeTime)).toThrow();
      range = ['invalid time', '06:00'];
      expect(() => executeOperator('12:00', range, inRangeTime)).toThrow();
      range = ['00:00', 'invalid time'];
      expect(() => executeOperator('12:00', range, inRangeTime)).toThrow();
    });

    it('should correctly check time range within the same day', () => {
      expect(executeOperator('03:00', range, inRangeTime)).toBeTruthy();
      range = ['00:00', '06:00'];
      expect(executeOperator('07:00', range, inRangeTime)).toBeFalsy();
    });

    it('should correctly check time range spanning midnight', () => {
      range = ['22:00', '06:00'];
      expect(executeOperator('23:00', range, inRangeTime)).toBeTruthy();
      expect(executeOperator('05:00', range, inRangeTime)).toBeTruthy();
      expect(executeOperator('07:00', range, inRangeTime)).toBeFalsy();
    });

    it('should correctly check time range with single digit hours', () => {
      range = ['6:00', '9:00'];
      expect(executeOperator('03:00', range, inRangeTime)).toBeFalsy();
      expect(executeOperator('07:00', range, inRangeTime)).toBeTruthy();
    });

    it('should correctly handle edge cases of exact times', () => {
      range = ['22:00', '06:00'];
      expect(executeOperator('22:00', range, inRangeTime)).toBeTruthy();
      expect(executeOperator('06:00', range, inRangeTime)).toBeTruthy();
    });

    it('should validate rhs as array of strings with length 2', () => {
      expect(() => executeOperator('12:00', 'invalid' as any, inRangeTime)).toThrow();
      expect(() => executeOperator('12:00', ['invalid'] as any, inRangeTime)).toThrow();
      expect(() => executeOperator('12:00', [null, null], inRangeTime)).toThrow();
    });
  });
});
