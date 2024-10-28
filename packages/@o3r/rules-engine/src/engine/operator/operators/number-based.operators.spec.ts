import {
  greaterThan,
  greaterThanOrEqual,
  lessOrEqual,
  lessThan
} from './number-based.operators';

describe('Number based operator', () => {
  describe('greaterThanOrEqual', () => {
    test('should have a valid name', () => {
      expect(greaterThanOrEqual.name).toBe('greaterThanOrEqual');
    });

    test('should exclude non-number value', () => {
      expect(greaterThanOrEqual.validateRhs).toBeDefined();
      expect(greaterThanOrEqual.validateLhs).toBeDefined();
      if (!greaterThanOrEqual.validateRhs || !greaterThanOrEqual.validateLhs) {
        return;
      }

      expect(greaterThanOrEqual.validateRhs(null as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateRhs(undefined as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateRhs('string' as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateRhs(123)).toBeTruthy();
      expect(greaterThanOrEqual.validateLhs(null as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateLhs(undefined as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateLhs('string' as any)).toBeFalsy();
      expect(greaterThanOrEqual.validateLhs(123)).toBeTruthy();
    });

    test('should pass if the left hand value is greater than the right hand value', () => {
      expect(greaterThanOrEqual.evaluator(6, 2)).toBeTruthy();
      expect(greaterThanOrEqual.evaluator(6, 6)).toBeTruthy();
      expect(greaterThanOrEqual.evaluator(6, 7)).toBeFalsy();
    });
  });

  describe('greaterThan', () => {
    test('should have a valid name', () => {
      expect(greaterThan.name).toBe('greaterThan');
    });

    test('should exclude non-number value', () => {
      expect(greaterThan.validateRhs).toBeDefined();
      expect(greaterThan.validateLhs).toBeDefined();
      if (!greaterThan.validateRhs || !greaterThan.validateLhs) {
        return;
      }

      expect(greaterThan.validateRhs(null as any)).toBeFalsy();
      expect(greaterThan.validateRhs(undefined as any)).toBeFalsy();
      expect(greaterThan.validateRhs('string' as any)).toBeFalsy();
      expect(greaterThan.validateRhs(123)).toBeTruthy();
      expect(greaterThan.validateLhs(null as any)).toBeFalsy();
      expect(greaterThan.validateLhs(undefined as any)).toBeFalsy();
      expect(greaterThan.validateLhs('string' as any)).toBeFalsy();
      expect(greaterThan.validateLhs(123)).toBeTruthy();
    });

    test('should pass if the left hand value is greater than the right hand value', () => {
      expect(greaterThan.evaluator(6, 2)).toBeTruthy();
      expect(greaterThan.evaluator(6, 6)).toBeFalsy();
      expect(greaterThan.evaluator(6, 7)).toBeFalsy();
    });
  });

  describe('lessOrEqual', () => {
    test('should have a valid name', () => {
      expect(lessOrEqual.name).toBe('lessOrEqual');
    });

    test('should exclude non-number value', () => {
      expect(lessOrEqual.validateRhs).toBeDefined();
      expect(lessOrEqual.validateLhs).toBeDefined();
      if (!lessOrEqual.validateRhs || !lessOrEqual.validateLhs) {
        return;
      }

      expect(lessOrEqual.validateRhs(null as any)).toBeFalsy();
      expect(lessOrEqual.validateRhs(undefined as any)).toBeFalsy();
      expect(lessOrEqual.validateRhs('string' as any)).toBeFalsy();
      expect(lessOrEqual.validateRhs(123)).toBeTruthy();
      expect(lessOrEqual.validateLhs(null as any)).toBeFalsy();
      expect(lessOrEqual.validateLhs(undefined as any)).toBeFalsy();
      expect(lessOrEqual.validateLhs('string' as any)).toBeFalsy();
      expect(lessOrEqual.validateLhs(123)).toBeTruthy();
    });

    test('should pass if the left hand value is greater than the right hand value', () => {
      expect(lessOrEqual.evaluator(2, 6)).toBeTruthy();
      expect(lessOrEqual.evaluator(6, 6)).toBeTruthy();
      expect(lessOrEqual.evaluator(7, 6)).toBeFalsy();
    });
  });

  describe('lessThan', () => {
    test('should have a valid name', () => {
      expect(lessThan.name).toBe('lessThan');
    });

    test('should exclude non-number value', () => {
      expect(lessThan.validateRhs).toBeDefined();
      expect(lessThan.validateLhs).toBeDefined();
      if (!lessThan.validateRhs || !lessThan.validateLhs) {
        return;
      }

      expect(lessThan.validateRhs(null as any)).toBeFalsy();
      expect(lessThan.validateRhs(undefined as any)).toBeFalsy();
      expect(lessThan.validateRhs('string' as any)).toBeFalsy();
      expect(lessThan.validateRhs(123)).toBeTruthy();
      expect(lessThan.validateLhs(null as any)).toBeFalsy();
      expect(lessThan.validateLhs(undefined as any)).toBeFalsy();
      expect(lessThan.validateLhs('string' as any)).toBeFalsy();
      expect(lessThan.validateLhs(123)).toBeTruthy();
    });

    test('should pass if the left hand value is greater than the right hand value', () => {
      expect(lessThan.evaluator(2, 6)).toBeTruthy();
      expect(lessThan.evaluator(6, 6)).toBeFalsy();
      expect(lessThan.evaluator(7, 6)).toBeFalsy();
    });
  });
});
