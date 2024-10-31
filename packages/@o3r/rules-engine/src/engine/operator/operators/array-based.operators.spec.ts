import {
  allEqual,
  allGreater,
  allIn,
  allLower,
  allMatch,
  allNotIn,
  allRangeNumber,
  arrayContains,
  lengthEquals,
  lengthGreaterThan,
  lengthGreaterThanOrEquals,
  lengthLessThan,
  lengthLessThanOrEquals,
  lengthNotEquals,
  notArrayContains,
  notStringContains,
  oneEquals,
  oneGreater,
  oneIn,
  oneLower,
  oneMatches,
  oneRangeNumber,
  stringContains
} from './array-based.operators';

describe('Array based operator', () => {
  describe('arrayContains', () => {
    test('should have a valid name', () => {
      expect(arrayContains.name).toBe('arrayContains');
    });

    test('should exclude non-array left hand operand', () => {
      expect(arrayContains.validateLhs).toBeDefined();
      if (!arrayContains.validateLhs) {
        return;
      }

      expect(arrayContains.validateLhs([])).toBeTruthy();
      expect(arrayContains.validateLhs(null as any)).toBeFalsy();
      expect(arrayContains.validateLhs(undefined as any)).toBeFalsy();
      expect(arrayContains.validateLhs(/string/ as any)).toBeFalsy();
      expect(arrayContains.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if the value is in the left hand array', () => {
      const lhs = ['nok', 'ok', 123];

      expect(arrayContains.evaluator(lhs, 'ok')).toBeTruthy();
      expect(arrayContains.evaluator(lhs, '123')).toBeFalsy();
      expect(arrayContains.evaluator(lhs, 'other')).toBeFalsy();
    });
  });

  describe('contain', () => {
    test('should have a valid name', () => {
      expect(stringContains.name).toBe('stringContains');
    });

    test('should exclude non-array left hand operand', () => {
      expect(stringContains.validateLhs).toBeDefined();
      if (!stringContains.validateLhs) {
        return;
      }

      expect(stringContains.validateLhs('string')).toBeTruthy();
      expect(stringContains.validateLhs([] as any)).toBeFalsy();
      expect(stringContains.validateLhs(null as any)).toBeFalsy();
      expect(stringContains.validateLhs(undefined as any)).toBeFalsy();
      expect(stringContains.validateLhs(/string/ as any)).toBeFalsy();
      expect(stringContains.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if the value is in the left hand string', () => {
      const myString = 'this is a test';

      expect(stringContains.evaluator(myString, 'this')).toBeTruthy();
      expect(stringContains.evaluator(myString, 'a ')).toBeTruthy();
      expect(stringContains.evaluator(myString, 'test')).toBeTruthy();
      expect(stringContains.evaluator(myString, 'somethingelse')).toBeFalsy();
    });
  });

  describe('notArrayContains', () => {
    test('should have a valid name', () => {
      expect(notArrayContains.name).toBe('notArrayContains');
    });

    test('should exclude non-array left hand operand', () => {
      expect(notArrayContains.validateLhs).toBeDefined();
      if (!notArrayContains.validateLhs) {
        return;
      }

      expect(notArrayContains.validateLhs([])).toBeTruthy();
      expect(notArrayContains.validateLhs(null as any)).toBeFalsy();
      expect(notArrayContains.validateLhs(undefined as any)).toBeFalsy();
      expect(notArrayContains.validateLhs(/string/ as any)).toBeFalsy();
      expect(notArrayContains.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if the value is not in the left hand array', () => {
      const lhs = ['nok', 'ok', 123];

      expect(notArrayContains.evaluator(lhs, 'ok')).toBeFalsy();
      expect(notArrayContains.evaluator(lhs, '123')).toBeTruthy();
      expect(notArrayContains.evaluator(lhs, 'other')).toBeTruthy();
    });
  });

  describe('notStringContains', () => {
    test('should have a valid name', () => {
      expect(notStringContains.name).toBe('notStringContains');
    });

    test('should exclude non-array left hand operand', () => {
      expect(notStringContains.validateLhs).toBeDefined();
      if (!notStringContains.validateLhs) {
        return;
      }

      expect(notStringContains.validateLhs('string')).toBeTruthy();
      expect(notStringContains.validateLhs(null as any)).toBeFalsy();
      expect(notStringContains.validateLhs(undefined as any)).toBeFalsy();
      expect(notStringContains.validateLhs(/string/ as any)).toBeFalsy();
      expect(notStringContains.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if the value is not in the left hand string', () => {
      const lhs = 'this is a string';

      expect(notStringContains.evaluator(lhs, 'this ')).toBeFalsy();
      expect(notStringContains.evaluator(lhs, ' string')).toBeFalsy();
      expect(notStringContains.evaluator(lhs, 'whatever')).toBeTruthy();
    });
  });

  describe('allEqual', () => {
    test('should have a valid name', () => {
      expect(allEqual.name).toBe('allEqual');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allEqual.validateLhs).toBeDefined();
      if (!allEqual.validateLhs) {
        return;
      }

      expect(allEqual.validateLhs([])).toBeTruthy();
      expect(allEqual.validateLhs(null as any)).toBeFalsy();
      expect(allEqual.validateLhs(undefined as any)).toBeFalsy();
      expect(allEqual.validateLhs('string' as any)).toBeFalsy();
      expect(allEqual.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if every values are equals to right hand value', () => {
      const lhs = ['123', 123];
      const lhs2 = ['ok', 'ok', 'nok'];

      expect(allEqual.evaluator(lhs, 'notValid')).toBeFalsy();
      expect(allEqual.evaluator(lhs, '123')).toBeTruthy();
      expect(allEqual.evaluator(lhs, 123)).toBeTruthy();
      expect(allEqual.evaluator(lhs2, 'ok')).toBeFalsy();
    });
  });

  describe('allGreater', () => {
    test('should have a valid name', () => {
      expect(allGreater.name).toBe('allGreater');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allGreater.validateLhs).toBeDefined();
      if (!allGreater.validateLhs) {
        return;
      }

      expect(allGreater.validateLhs([])).toBeTruthy();
      expect(allGreater.validateLhs(null as any)).toBeFalsy();
      expect(allGreater.validateLhs(undefined as any)).toBeFalsy();
      expect(allGreater.validateLhs('string' as any)).toBeFalsy();
      expect(allGreater.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-number right hand operand', () => {
      expect(allGreater.validateRhs).toBeDefined();
      if (!allGreater.validateRhs) {
        return;
      }

      expect(allGreater.validateRhs(null as any)).toBeFalsy();
      expect(allGreater.validateRhs(undefined as any)).toBeFalsy();
      expect(allGreater.validateRhs('string' as any)).toBeFalsy();
      expect(allGreater.validateRhs(123)).toBeTruthy();
      expect(allGreater.validateRhs('123' as any)).toBeTruthy();
    });

    test('should pass only if every values are greater than the right hand value', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(allGreater.evaluator(lhs, 1000)).toBeFalsy();
      expect(allGreater.evaluator(lhs, 100)).toBeTruthy();
      expect(allGreater.evaluator(lhs, 123)).toBeFalsy();
    });
  });

  describe('allIn', () => {
    test('should have a valid name', () => {
      expect(allIn.name).toBe('allIn');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allIn.validateLhs).toBeDefined();
      if (!allIn.validateLhs) {
        return;
      }

      expect(allIn.validateLhs([])).toBeTruthy();
      expect(allIn.validateLhs(null as any)).toBeFalsy();
      expect(allIn.validateLhs(undefined as any)).toBeFalsy();
      expect(allIn.validateLhs('string' as any)).toBeFalsy();
      expect(allIn.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-array right hand operand', () => {
      expect(allIn.validateRhs).toBeDefined();
      if (!allIn.validateRhs) {
        return;
      }

      expect(allIn.validateRhs([])).toBeTruthy();
      expect(allIn.validateRhs(null as any)).toBeFalsy();
      expect(allIn.validateRhs(undefined as any)).toBeFalsy();
      expect(allIn.validateRhs('string' as any)).toBeFalsy();
      expect(allIn.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass only if every values are in to right hand value list', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(allIn.evaluator(lhs, [1000])).toBeFalsy();
      expect(allIn.evaluator(lhs, [321, 123, '123', 'other'])).toBeTruthy();
      expect(allIn.evaluator(lhs, [123])).toBeFalsy();
    });
  });

  describe('allNotIn', () => {
    test('should have a valid name', () => {
      expect(allNotIn.name).toBe('allNotIn');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allNotIn.validateLhs).toBeDefined();
      if (!allNotIn.validateLhs) {
        return;
      }

      expect(allNotIn.validateLhs([])).toBeTruthy();
      expect(allNotIn.validateLhs(null as any)).toBeFalsy();
      expect(allNotIn.validateLhs(undefined as any)).toBeFalsy();
      expect(allNotIn.validateLhs('string' as any)).toBeFalsy();
      expect(allNotIn.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-array right hand operand', () => {
      expect(allNotIn.validateRhs).toBeDefined();
      if (!allNotIn.validateRhs) {
        return;
      }

      expect(allNotIn.validateRhs([])).toBeTruthy();
      expect(allNotIn.validateRhs(null as any)).toBeFalsy();
      expect(allNotIn.validateRhs(undefined as any)).toBeFalsy();
      expect(allNotIn.validateRhs('string' as any)).toBeFalsy();
      expect(allNotIn.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass only if every values are not in to right hand value list', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(allNotIn.evaluator(lhs, [1000])).toBeTruthy();
      expect(allNotIn.evaluator(lhs, [321, 123, '123', 'other'])).toBeFalsy();
      expect(allNotIn.evaluator(lhs, [123])).toBeFalsy();
    });
  });

  describe('allLower', () => {
    test('should have a valid name', () => {
      expect(allLower.name).toBe('allLower');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allLower.validateLhs).toBeDefined();
      if (!allLower.validateLhs) {
        return;
      }

      expect(allLower.validateLhs([])).toBeTruthy();
      expect(allLower.validateLhs(null as any)).toBeFalsy();
      expect(allLower.validateLhs(undefined as any)).toBeFalsy();
      expect(allLower.validateLhs('string' as any)).toBeFalsy();
      expect(allLower.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-number right hand operand', () => {
      expect(allLower.validateRhs).toBeDefined();
      if (!allLower.validateRhs) {
        return;
      }

      expect(allLower.validateRhs(null as any)).toBeFalsy();
      expect(allLower.validateRhs(undefined as any)).toBeFalsy();
      expect(allLower.validateRhs('string' as any)).toBeFalsy();
      expect(allLower.validateRhs(123)).toBeTruthy();
      expect(allLower.validateRhs('123' as any)).toBeTruthy();
    });

    test('should pass only if every values are lower than the right hand value', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(allLower.evaluator(lhs, 1000)).toBeTruthy();
      expect(allLower.evaluator(lhs, 100)).toBeFalsy();
      expect(allLower.evaluator(lhs, 321)).toBeFalsy();
      expect(allLower.evaluator(lhs, 322)).toBeTruthy();
    });
  });

  describe('allMatch', () => {
    test('should have a valid name', () => {
      expect(allMatch.name).toBe('allMatch');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allMatch.validateLhs).toBeDefined();
      if (!allMatch.validateLhs) {
        return;
      }

      expect(allMatch.validateLhs([])).toBeTruthy();
      expect(allMatch.validateLhs(null as any)).toBeFalsy();
      expect(allMatch.validateLhs(undefined as any)).toBeFalsy();
      expect(allMatch.validateLhs('string' as any)).toBeFalsy();
      expect(allMatch.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-regExp right hand operand', () => {
      expect(allMatch.validateRhs).toBeDefined();
      if (!allMatch.validateRhs) {
        return;
      }

      expect(allMatch.validateRhs(null as any)).toBeFalsy();
      expect(allMatch.validateRhs(undefined as any)).toBeFalsy();
      expect(allMatch.validateRhs(123 as any)).toBeFalsy();
      expect(allMatch.validateRhs('string')).toBeTruthy();
    });

    test('should pass only if every values are included in the right hand range', () => {
      const lhs: any[] = ['test', 'other test', 'still a test'];
      const lhs2: any[] = ['test', 'test', 'test'];

      expect(allMatch.evaluator(lhs, 't[ea]st')).toBeTruthy();
      expect(allMatch.evaluator(lhs, 'test')).toBeTruthy();
      expect(allMatch.evaluator(lhs2, 'test')).toBeTruthy();
      expect(allMatch.evaluator(lhs2, 'notTest')).toBeFalsy();
    });
  });

  describe('allRangeNumber', () => {
    test('should have a valid name', () => {
      expect(allRangeNumber.name).toBe('allRangeNumber');
    });

    test('should exclude non-array left hand operand', () => {
      expect(allRangeNumber.validateLhs).toBeDefined();
      if (!allRangeNumber.validateLhs) {
        return;
      }

      expect(allRangeNumber.validateLhs([])).toBeTruthy();
      expect(allRangeNumber.validateLhs(null as any)).toBeFalsy();
      expect(allRangeNumber.validateLhs(undefined as any)).toBeFalsy();
      expect(allRangeNumber.validateLhs('string' as any)).toBeFalsy();
      expect(allRangeNumber.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non valid object right hand operand', () => {
      expect(allRangeNumber.validateRhs).toBeDefined();
      if (!allRangeNumber.validateRhs) {
        return;
      }

      expect(allRangeNumber.validateRhs(null as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs(undefined as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs('string' as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs({} as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs([10] as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs(['10'] as any)).toBeFalsy();
      expect(allRangeNumber.validateRhs([10, 20])).toBeTruthy();
      expect(allRangeNumber.validateRhs(['10' as any, '20' as any])).toBeTruthy();
    });

    test('should pass only if every values are included in the right hand range', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(allRangeNumber.evaluator(lhs, [100, 400])).toBeTruthy();
      expect(allRangeNumber.evaluator(lhs, [400, 100])).toBeFalsy();
      expect(allRangeNumber.evaluator(lhs, [100, 300])).toBeFalsy();
      expect(allRangeNumber.evaluator(lhs, [200, 400])).toBeFalsy();
    });
  });

  describe('oneEquals', () => {
    test('should have a valid name', () => {
      expect(oneEquals.name).toBe('oneEquals');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneEquals.validateLhs).toBeDefined();
      if (!oneEquals.validateLhs) {
        return;
      }

      expect(oneEquals.validateLhs([])).toBeTruthy();
      expect(oneEquals.validateLhs(null as any)).toBeFalsy();
      expect(oneEquals.validateLhs(undefined as any)).toBeFalsy();
      expect(oneEquals.validateLhs('string' as any)).toBeFalsy();
      expect(oneEquals.validateLhs(123 as any)).toBeFalsy();
    });

    test('should pass only if at least one value is equals to right hand value', () => {
      const lhs = ['123', 'nok'];
      const lhs2 = [123, 'ok', 'nok'];

      expect(oneEquals.evaluator(lhs, 'notValid')).toBeFalsy();
      expect(oneEquals.evaluator(lhs, 123)).toBeTruthy();
      expect(oneEquals.evaluator(lhs2, '123')).toBeTruthy();
      expect(oneEquals.evaluator(lhs2, 123)).toBeTruthy();
    });
  });

  describe('oneGreater', () => {
    test('should have a valid name', () => {
      expect(oneGreater.name).toBe('oneGreater');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneGreater.validateLhs).toBeDefined();
      if (!oneGreater.validateLhs) {
        return;
      }

      expect(oneGreater.validateLhs([])).toBeTruthy();
      expect(oneGreater.validateLhs(null as any)).toBeFalsy();
      expect(oneGreater.validateLhs(undefined as any)).toBeFalsy();
      expect(oneGreater.validateLhs('string' as any)).toBeFalsy();
      expect(oneGreater.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-number right hand operand', () => {
      expect(oneGreater.validateRhs).toBeDefined();
      if (!oneGreater.validateRhs) {
        return;
      }

      expect(oneGreater.validateRhs(null as any)).toBeFalsy();
      expect(oneGreater.validateRhs(undefined as any)).toBeFalsy();
      expect(oneGreater.validateRhs('string' as any)).toBeFalsy();
      expect(oneGreater.validateRhs(123)).toBeTruthy();
      expect(oneGreater.validateRhs('123' as any)).toBeTruthy();
    });

    test('should pass only if at least one value is greater than the right hand value', () => {
      const lhs: any[] = [321, 123, '500'];

      expect(oneGreater.evaluator(lhs, 1000)).toBeFalsy();
      expect(oneGreater.evaluator(lhs, 100)).toBeTruthy();
      expect(oneGreater.evaluator(lhs, 400)).toBeTruthy();
      expect(oneGreater.evaluator(lhs, '400' as any)).toBeTruthy();
      expect(oneGreater.evaluator(lhs, 500)).toBeFalsy();
    });
  });

  describe('oneIn', () => {
    test('should have a valid name', () => {
      expect(oneIn.name).toBe('oneIn');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneIn.validateLhs).toBeDefined();
      if (!oneIn.validateLhs) {
        return;
      }

      expect(oneIn.validateLhs([])).toBeTruthy();
      expect(oneIn.validateLhs(null as any)).toBeFalsy();
      expect(oneIn.validateLhs(undefined as any)).toBeFalsy();
      expect(oneIn.validateLhs('string' as any)).toBeFalsy();
      expect(oneIn.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-array right hand operand', () => {
      expect(oneIn.validateRhs).toBeDefined();
      if (!oneIn.validateRhs) {
        return;
      }

      expect(oneIn.validateRhs([])).toBeTruthy();
      expect(oneIn.validateRhs(null as any)).toBeFalsy();
      expect(oneIn.validateRhs(undefined as any)).toBeFalsy();
      expect(oneIn.validateRhs('string' as any)).toBeFalsy();
      expect(oneIn.validateRhs(123 as any)).toBeFalsy();
    });

    test('should pass only if at least one value is in to right hand value list', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(oneIn.evaluator(lhs, [1000])).toBeFalsy();
      expect(oneIn.evaluator(lhs, [321])).toBeTruthy();
      expect(oneIn.evaluator(lhs, ['123'])).toBeTruthy();
    });
  });

  describe('oneLower', () => {
    test('should have a valid name', () => {
      expect(oneLower.name).toBe('oneLower');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneLower.validateLhs).toBeDefined();
      if (!oneLower.validateLhs) {
        return;
      }

      expect(oneLower.validateLhs([])).toBeTruthy();
      expect(oneLower.validateLhs(null as any)).toBeFalsy();
      expect(oneLower.validateLhs(undefined as any)).toBeFalsy();
      expect(oneLower.validateLhs('string' as any)).toBeFalsy();
      expect(oneLower.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-number right hand operand', () => {
      expect(oneLower.validateRhs).toBeDefined();
      if (!oneLower.validateRhs) {
        return;
      }

      expect(oneLower.validateRhs(null as any)).toBeFalsy();
      expect(oneLower.validateRhs(undefined as any)).toBeFalsy();
      expect(oneLower.validateRhs('string' as any)).toBeFalsy();
      expect(oneLower.validateRhs(123)).toBeTruthy();
      expect(oneLower.validateRhs('123' as any)).toBeTruthy();
    });

    test('should pass only if at least one value are lower than the right hand value', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(oneLower.evaluator(lhs, 200)).toBeTruthy();
      expect(oneLower.evaluator(lhs, 100)).toBeFalsy();
      expect(oneLower.evaluator(lhs, 123)).toBeFalsy();
    });
  });

  describe('oneMatches', () => {
    test('should have a valid name', () => {
      expect(oneMatches.name).toBe('oneMatches');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneMatches.validateLhs).toBeDefined();
      if (!oneMatches.validateLhs) {
        return;
      }

      expect(oneMatches.validateLhs([])).toBeTruthy();
      expect(oneMatches.validateLhs(null as any)).toBeFalsy();
      expect(oneMatches.validateLhs(undefined as any)).toBeFalsy();
      expect(oneMatches.validateLhs('string' as any)).toBeFalsy();
      expect(oneMatches.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non-regExp right hand operand', () => {
      expect(oneMatches.validateRhs).toBeDefined();
      if (!oneMatches.validateRhs) {
        return;
      }

      expect(oneMatches.validateRhs(null as any)).toBeFalsy();
      expect(oneMatches.validateRhs(undefined as any)).toBeFalsy();
      expect(oneMatches.validateRhs(123 as any)).toBeFalsy();
      expect(oneMatches.validateRhs(/string/ as any)).toBeFalsy();
      expect(oneMatches.validateRhs('test')).toBeTruthy();
    });

    test('should pass only if at least one value is included in the right hand range', () => {
      const lhs: any[] = ['test', 'other test', 'still a test'];
      const lhs2: any[] = ['test', 'test', 'test'];

      expect(oneMatches.evaluator(lhs, 'other')).toBeTruthy();
      expect(oneMatches.evaluator(lhs, 't[ea]st')).toBeTruthy();
      expect(oneMatches.evaluator(lhs, 'test')).toBeTruthy();
      expect(oneMatches.evaluator(lhs2, 'test')).toBeTruthy();
      expect(oneMatches.evaluator(lhs2, 'notTest')).toBeFalsy();
    });
  });

  describe('oneRangeNumber', () => {
    test('should have a valid name', () => {
      expect(oneRangeNumber.name).toBe('oneRangeNumber');
    });

    test('should exclude non-array left hand operand', () => {
      expect(oneRangeNumber.validateLhs).toBeDefined();
      if (!oneRangeNumber.validateLhs) {
        return;
      }

      expect(oneRangeNumber.validateLhs([])).toBeTruthy();
      expect(oneRangeNumber.validateLhs(null as any)).toBeFalsy();
      expect(oneRangeNumber.validateLhs(undefined as any)).toBeFalsy();
      expect(oneRangeNumber.validateLhs('string' as any)).toBeFalsy();
      expect(oneRangeNumber.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non valid object right hand operand', () => {
      expect(oneRangeNumber.validateRhs).toBeDefined();
      if (!oneRangeNumber.validateRhs) {
        return;
      }

      expect(oneRangeNumber.validateRhs(null as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs(undefined as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs('string' as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs({} as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs([20] as any)).toBeFalsy();
      expect(oneRangeNumber.validateRhs([10, 20])).toBeTruthy();
      expect(oneRangeNumber.validateRhs(['10' as any, '20' as any])).toBeTruthy();
    });

    test('should pass only if one of the value is included in the right hand range', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(oneRangeNumber.evaluator(lhs, [100, 400])).toBeTruthy();
      expect(oneRangeNumber.evaluator(lhs, [400, 100])).toBeFalsy();
      expect(oneRangeNumber.evaluator(lhs, [100, 300])).toBeTruthy();
    });
  });

  describe('lengthEquals', () => {
    test('should have a valid name', () => {
      expect(lengthEquals.name).toBe('lengthEquals');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthEquals.validateLhs).toBeDefined();
      if (!lengthEquals.validateLhs) {
        return;
      }

      expect(lengthEquals.validateLhs([])).toBeTruthy();
      expect(lengthEquals.validateLhs(null as any)).toBeFalsy();
      expect(lengthEquals.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthEquals.validateLhs('string' as any)).toBeFalsy();
      expect(lengthEquals.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthEquals.validateRhs).toBeDefined();
      if (!lengthEquals.validateRhs) {
        return;
      }

      expect(lengthEquals.validateRhs(null as any)).toBeFalsy();
      expect(lengthEquals.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthEquals.validateRhs('string' as any)).toBeFalsy();
      expect(lengthEquals.validateRhs({} as any)).toBeFalsy();
      expect(lengthEquals.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthEquals.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthEquals.validateRhs([20] as any)).toBeFalsy();
      expect(lengthEquals.validateRhs(5)).toBeTruthy();
      expect(lengthEquals.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length equals the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthEquals.evaluator(lhs, 3)).toBeTruthy();
      expect(lengthEquals.evaluator(lhs, 1)).toBeFalsy();
    });
  });

  describe('lengthNotEquals', () => {
    test('should have a valid name', () => {
      expect(lengthNotEquals.name).toBe('lengthNotEquals');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthNotEquals.validateLhs).toBeDefined();
      if (!lengthNotEquals.validateLhs) {
        return;
      }

      expect(lengthNotEquals.validateLhs([])).toBeTruthy();
      expect(lengthNotEquals.validateLhs(null as any)).toBeFalsy();
      expect(lengthNotEquals.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthNotEquals.validateLhs('string' as any)).toBeFalsy();
      expect(lengthNotEquals.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthNotEquals.validateRhs).toBeDefined();
      if (!lengthNotEquals.validateRhs) {
        return;
      }

      expect(lengthNotEquals.validateRhs(null as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs('string' as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs({} as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs([20] as any)).toBeFalsy();
      expect(lengthNotEquals.validateRhs(5)).toBeTruthy();
      expect(lengthNotEquals.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length does not equal the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthNotEquals.evaluator(lhs, 1)).toBeTruthy();
      expect(lengthNotEquals.evaluator(lhs, 3)).toBeFalsy();
    });
  });

  describe('lengthGreaterThanOrEquals', () => {
    test('should have a valid name', () => {
      expect(lengthGreaterThanOrEquals.name).toBe('lengthGreaterThanOrEquals');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthGreaterThanOrEquals.validateLhs).toBeDefined();
      if (!lengthGreaterThanOrEquals.validateLhs) {
        return;
      }

      expect(lengthGreaterThanOrEquals.validateLhs([])).toBeTruthy();
      expect(lengthGreaterThanOrEquals.validateLhs(null as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateLhs('string' as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthGreaterThanOrEquals.validateRhs).toBeDefined();
      if (!lengthGreaterThanOrEquals.validateRhs) {
        return;
      }

      expect(lengthGreaterThanOrEquals.validateRhs(null as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs('string' as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs({} as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs([20] as any)).toBeFalsy();
      expect(lengthGreaterThanOrEquals.validateRhs(5)).toBeTruthy();
      expect(lengthGreaterThanOrEquals.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length is less than or equals the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthGreaterThanOrEquals.evaluator(lhs, 1)).toBeTruthy();
      expect(lengthGreaterThanOrEquals.evaluator(lhs, 3)).toBeTruthy();
      expect(lengthGreaterThanOrEquals.evaluator(lhs, 4)).toBeFalsy();
    });
  });

  describe('lengthGreaterThan', () => {
    test('should have a valid name', () => {
      expect(lengthGreaterThan.name).toBe('lengthGreaterThan');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthGreaterThan.validateLhs).toBeDefined();
      if (!lengthGreaterThan.validateLhs) {
        return;
      }

      expect(lengthGreaterThan.validateLhs([])).toBeTruthy();
      expect(lengthGreaterThan.validateLhs(null as any)).toBeFalsy();
      expect(lengthGreaterThan.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthGreaterThan.validateLhs('string' as any)).toBeFalsy();
      expect(lengthGreaterThan.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthGreaterThan.validateRhs).toBeDefined();
      if (!lengthGreaterThan.validateRhs) {
        return;
      }

      expect(lengthGreaterThan.validateRhs(null as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs('string' as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs({} as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs([20] as any)).toBeFalsy();
      expect(lengthGreaterThan.validateRhs(5)).toBeTruthy();
      expect(lengthGreaterThan.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length is less than or equals the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthGreaterThan.evaluator(lhs, 1)).toBeTruthy();
      expect(lengthGreaterThan.evaluator(lhs, 3)).toBeFalsy();
      expect(lengthGreaterThan.evaluator(lhs, 4)).toBeFalsy();
    });
  });

  describe('lengthLessThanOrEquals', () => {
    test('should have a valid name', () => {
      expect(lengthLessThanOrEquals.name).toBe('lengthLessThanOrEquals');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthLessThanOrEquals.validateLhs).toBeDefined();
      if (!lengthLessThanOrEquals.validateLhs) {
        return;
      }

      expect(lengthLessThanOrEquals.validateLhs([])).toBeTruthy();
      expect(lengthLessThanOrEquals.validateLhs(null as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateLhs('string' as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthLessThanOrEquals.validateRhs).toBeDefined();
      if (!lengthLessThanOrEquals.validateRhs) {
        return;
      }

      expect(lengthLessThanOrEquals.validateRhs(null as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs('string' as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs({} as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs([20] as any)).toBeFalsy();
      expect(lengthLessThanOrEquals.validateRhs(5)).toBeTruthy();
      expect(lengthLessThanOrEquals.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length is less than or equals the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthLessThanOrEquals.evaluator(lhs, 4)).toBeTruthy();
      expect(lengthLessThanOrEquals.evaluator(lhs, 3)).toBeTruthy();
      expect(lengthLessThanOrEquals.evaluator(lhs, 1)).toBeFalsy();
    });
  });

  describe('lengthLessThan', () => {
    test('should have a valid name', () => {
      expect(lengthLessThan.name).toBe('lengthLessThan');
    });

    test('should exclude non-array left hand operand', () => {
      expect(lengthLessThan.validateLhs).toBeDefined();
      if (!lengthLessThan.validateLhs) {
        return;
      }

      expect(lengthLessThan.validateLhs([])).toBeTruthy();
      expect(lengthLessThan.validateLhs(null as any)).toBeFalsy();
      expect(lengthLessThan.validateLhs(undefined as any)).toBeFalsy();
      expect(lengthLessThan.validateLhs('string' as any)).toBeFalsy();
      expect(lengthLessThan.validateLhs(123 as any)).toBeFalsy();
    });

    test('should exclude non number right hand operand', () => {
      expect(lengthLessThan.validateRhs).toBeDefined();
      if (!lengthLessThan.validateRhs) {
        return;
      }

      expect(lengthLessThan.validateRhs(null as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs(undefined as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs('string' as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs({} as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs({ from: 10 } as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs({ to: 20 } as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs([20] as any)).toBeFalsy();
      expect(lengthLessThan.validateRhs(5)).toBeTruthy();
      expect(lengthLessThan.validateRhs(0)).toBeTruthy();
    });

    test('should pass only if the value length is less than or equals the right hand number', () => {
      const lhs: any[] = [321, 123, '123'];

      expect(lengthLessThan.evaluator(lhs, 4)).toBeTruthy();
      expect(lengthLessThan.evaluator(lhs, 3)).toBeFalsy();
      expect(lengthLessThan.evaluator(lhs, 1)).toBeFalsy();
    });
  });
});
