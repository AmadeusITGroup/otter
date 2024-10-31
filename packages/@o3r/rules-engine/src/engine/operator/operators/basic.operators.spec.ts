import {
  equals,
  inArray,
  inString,
  isDefined,
  isUndefined,
  matchesPattern,
  notEquals,
  notInArray,
  notInString
} from './basic.operators';

describe('Basic operator', () => {
  describe('equals', () => {
    test('should have a valid name', () => {
      expect(equals.name).toBe('equals');
    });

    test('should pass if the left hand value is equals to the right hand value', () => {
      expect(equals.evaluator(1, 1)).toBeTruthy();
      expect(equals.evaluator(1, '1')).toBeTruthy();
      expect(equals.evaluator(false, 2)).toBeFalsy();
      expect(equals.evaluator(false, 'false')).toBeFalsy();
      expect(equals.evaluator(1, 2)).toBeFalsy();
      expect(equals.evaluator(1, '2')).toBeFalsy();
      expect(equals.evaluator(1, null)).toBeFalsy();
    });
  });

  describe('notEquals', () => {
    test('should have a valid name', () => {
      expect(notEquals.name).toBe('notEquals');
    });

    test('should pass if the left hand value is equals to the right hand value', () => {
      expect(notEquals.evaluator(1, 1)).toBeFalsy();
      expect(notEquals.evaluator(1, '1')).toBeFalsy();
      expect(notEquals.evaluator(false, 2)).toBeTruthy();
      expect(notEquals.evaluator(false, true)).toBeTruthy();
      expect(notEquals.evaluator(false, 'false')).toBeTruthy();
      expect(notEquals.evaluator(1, 2)).toBeTruthy();
      expect(notEquals.evaluator(1, '2')).toBeTruthy();
      expect(notEquals.evaluator(1, null)).toBeTruthy();
    });
  });

  describe('inString', () => {
    test('should have a valid name', () => {
      expect(inString.name).toBe('inString');
    });

    test('should exclude non-array and non-string right hand operand', () => {
      expect(inString.validateRhs).toBeDefined();
      if (!inString.validateRhs) {
        return;
      }

      expect(inString.validateRhs([] as any)).toBeFalsy();
      expect(inString.validateRhs(null as any)).toBeFalsy();
      expect(inString.validateRhs(undefined as any)).toBeFalsy();
      expect(inString.validateRhs('string')).toBeTruthy();
      expect(inString.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass if the left hand value is in to the right hand value', () => {
      expect(inString.evaluator('test', 'other test' as any)).toBeTruthy();
      expect(inString.evaluator('test', 'should fail' as any)).toBeFalsy();
    });
  });

  describe('inArray', () => {
    test('should have a valid name', () => {
      expect(inArray.name).toBe('inArray');
    });

    test('should exclude non-array and non-string right hand operand', () => {
      expect(inArray.validateRhs).toBeDefined();
      if (!inArray.validateRhs) {
        return;
      }

      expect(inArray.validateRhs([])).toBeTruthy();
      expect(inArray.validateRhs(null as any)).toBeFalsy();
      expect(inArray.validateRhs(undefined as any)).toBeFalsy();
      expect(inArray.validateRhs('string' as any)).toBeFalsy();
      expect(inArray.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass if the left hand value is in to the right hand value', () => {
      expect(inArray.evaluator('test', ['test', 'other'])).toBeTruthy();
      expect(inArray.evaluator(1, [1, 2, 3])).toBeTruthy();
      expect(inArray.evaluator(1, [5, 6, 7])).toBeFalsy();
    });
  });

  describe('notInString', () => {
    test('should have a valid name', () => {
      expect(notInString.name).toBe('notInString');
    });

    test('should exclude non-array and non-string right hand operand', () => {
      expect(notInString.validateRhs).toBeDefined();
      if (!notInString.validateRhs) {
        return;
      }

      expect(notInString.validateRhs([] as any)).toBeFalsy();
      expect(notInString.validateRhs(null as any)).toBeFalsy();
      expect(notInString.validateRhs(undefined as any)).toBeFalsy();
      expect(notInString.validateRhs('string')).toBeTruthy();
      expect(notInString.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass if the left hand value is in to the right hand value', () => {
      expect(notInString.evaluator('test', 'other test' as any)).toBeFalsy();
      expect(notInString.evaluator('test', 'should not fail' as any)).toBeTruthy();
    });
  });

  describe('notInArray', () => {
    test('should have a valid name', () => {
      expect(notInArray.name).toBe('notInArray');
    });

    test('should exclude non-array and non-string right hand operand', () => {
      expect(notInArray.validateRhs).toBeDefined();
      if (!notInArray.validateRhs) {
        return;
      }

      expect(notInArray.validateRhs([])).toBeTruthy();
      expect(notInArray.validateRhs(null as any)).toBeFalsy();
      expect(notInArray.validateRhs(undefined as any)).toBeFalsy();
      expect(notInArray.validateRhs('string' as any)).toBeFalsy();
      expect(notInArray.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass if the left hand value is in to the right hand value', () => {
      expect(notInArray.evaluator('test', ['test', 'other'])).toBeFalsy();
      expect(notInArray.evaluator(1, [1, 2, 3])).toBeFalsy();
      expect(notInArray.evaluator(1, [5, 6, 7])).toBeTruthy();
    });
  });

  describe('defined', () => {
    test('should have a valid name', () => {
      expect(isDefined.name).toBe('isDefined');
    });

    test('should pass if the left hand value is equals to the right hand value', () => {
      expect((isDefined as any).evaluator(undefined, 'param')).toBeFalsy();
      expect(isDefined.evaluator(1)).toBeTruthy();
      expect(isDefined.evaluator(false)).toBeTruthy();
      expect(isDefined.evaluator(1)).toBeTruthy();
      expect(isDefined.evaluator(null as any)).toBeFalsy();
      expect(isDefined.evaluator(undefined as any)).toBeFalsy();
    });
  });

  describe('undefined', () => {
    test('should have a valid name', () => {
      expect(isUndefined.name).toBe('isUndefined');
    });

    test('should pass if the left hand value is equals to the right hand value', () => {
      expect((isUndefined as any).evaluator(undefined, 'param')).toBeTruthy();
      expect(isUndefined.evaluator(1)).toBeFalsy();
      expect(isUndefined.evaluator(false)).toBeFalsy();
      expect(isUndefined.evaluator(1)).toBeFalsy();
      expect(isUndefined.evaluator(null as any)).toBeTruthy();
      expect(isUndefined.evaluator(undefined as any)).toBeTruthy();
    });
  });

  describe('matchesPattern', () => {
    test('should have a valid name', () => {
      expect(matchesPattern.name).toBe('matchesPattern');
    });

    test('should exclude non-string right hand operand', () => {
      expect(matchesPattern.validateRhs).toBeDefined();
      if (!matchesPattern.validateRhs) {
        return;
      }

      expect(matchesPattern.validateRhs('test')).toBeTruthy();
      expect(matchesPattern.validateRhs(/string/ as any)).toBeFalsy();
      expect(matchesPattern.validateRhs(null as any)).toBeFalsy();
      expect(matchesPattern.validateRhs(undefined as any)).toBeFalsy();
      expect(matchesPattern.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass if the left hand value matches the right hand value', () => {
      expect(matchesPattern.evaluator('test', 'T')).toBeFalsy();
      expect(matchesPattern.evaluator('test', '/T/i')).toBeTruthy();
      expect(matchesPattern.evaluator('test', '^t[ea]st')).toBeTruthy();
      expect(matchesPattern.evaluator('test', 'notTest')).toBeFalsy();
      expect(matchesPattern.evaluator('test/path/to/file', '\\/path/to/file')).toBeTruthy();
      expect(matchesPattern.evaluator('8000', '^8[0-9]{3}')).toBeTruthy();
      expect(matchesPattern.evaluator('8000', '/^8[0-9]{3}$/')).toBeTruthy();
    });
  });
});
