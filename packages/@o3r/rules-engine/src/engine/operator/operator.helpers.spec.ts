import {of} from 'rxjs';
import {executeOperator, isRangeNumber, isString, isSupportedSimpleTypes, isValidDate, isValidDateInput, isValidDateRange, numberValidator} from './operator.helpers';
import {Operator} from './operator.interface';

describe('Operator helpers', () => {
  describe('execute', () => {

    test('should validate both left hand and right hand operands', () => {
      const operator: Operator = {
        name: 'test',
        validateLhs: jest.fn().mockReturnValue(true),
        validateRhs: jest.fn().mockReturnValue(true),
        evaluator: jest.fn().mockReturnValue(true)
      };

      expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
      expect(operator.validateLhs).toHaveBeenCalledTimes(1);
      expect(operator.validateRhs).toHaveBeenCalledTimes(1);
      expect(operator.validateLhs).toHaveBeenCalledWith('testLhs');
      expect(operator.validateRhs).toHaveBeenCalledWith('testRhs');
      expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs', undefined);
    });

    test('should not evaluate the condition if the checks are not passed', () => {

      const operatorLhs: Operator = {
        name: 'test',
        validateLhs: jest.fn().mockReturnValue(false),
        evaluator: jest.fn().mockReturnValue(true)
      };
      const operatorRhs: Operator = {
        name: 'test',
        validateRhs: jest.fn().mockReturnValue(false),
        evaluator: jest.fn().mockReturnValue(true)
      };

      expect(() => executeOperator('testLhs', 'testRhs', operatorLhs)).toThrow();
      expect(operatorLhs.validateLhs).toHaveBeenCalledTimes(1);
      expect(operatorLhs.validateLhs).toHaveBeenCalledWith('testLhs');
      expect(operatorLhs.evaluator).not.toHaveBeenCalled();
      expect(operatorLhs.validateRhs).toBeUndefined();

      expect(() => executeOperator('testLhs', 'testRhs', operatorRhs)).toThrow();
      expect(operatorRhs.validateRhs).toHaveBeenCalledTimes(1);
      expect(operatorRhs.validateRhs).toHaveBeenCalledWith('testRhs');
      expect(operatorRhs.evaluator).not.toHaveBeenCalled();
      expect(operatorRhs.validateLhs).toBeUndefined();
    });

    test('should report unchecked operand value to the logger as warning', () => {

      const operatorLhs: Operator = {
        name: 'test',
        validateLhs: jest.fn().mockReturnValue(false),
        evaluator: jest.fn().mockReturnValue(true)
      };
      const operatorRhs: Operator = {
        name: 'test',
        validateRhs: jest.fn().mockReturnValue(false),
        evaluator: jest.fn().mockReturnValue(true)
      };

      expect(() => executeOperator('testLhs', 'testRhs', operatorLhs)).toThrow();
      expect(operatorLhs.validateLhs).toHaveBeenCalledTimes(1);
      expect(operatorLhs.validateLhs).toHaveBeenCalledWith('testLhs');

      expect(() => executeOperator('testLhs', 'testRhs', operatorRhs)).toThrow();
      expect(operatorRhs.validateRhs).toHaveBeenCalledTimes(1);
      expect(operatorRhs.validateRhs).toHaveBeenCalledWith('testRhs');
    });

    describe('should execute the validation', () => {
      test('with static value', () => {
        const operator: Operator = {
          name: 'test',
          evaluator: jest.fn().mockReturnValue(true)
        };

        expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs', undefined);
      });

      test('with promise value', () => {
        const operator: Operator = {
          name: 'test',
          evaluator: jest.fn().mockReturnValue(Promise.resolve(true))
        };

        expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs', undefined);
      });

      test('with observable value', () => {
        const operator: Operator = {
          name: 'test',
          evaluator: jest.fn().mockReturnValue(of(true))
        };

        expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs', undefined);
      });
    });
  });

  describe('numberValidator', () => {
    test('should return false if not a number', () => {
      expect(numberValidator([])).toBeFalsy();
      expect(numberValidator({})).toBeFalsy();
      expect(numberValidator('')).toBeFalsy();
      expect(numberValidator('test')).toBeFalsy();
      expect(numberValidator(false)).toBeFalsy();
      expect(numberValidator(true)).toBeFalsy();
    });

    test('should return true if a number', () => {
      expect(numberValidator(123)).toBeTruthy();
      expect(numberValidator(0)).toBeTruthy();
      expect(numberValidator('123')).toBeTruthy();
      expect(numberValidator('123.5')).toBeTruthy();
      expect(numberValidator(123.5)).toBeTruthy();
    });
  });

  describe('isRangeNumber', () => {
    test('should return false if not a range number', () => {
      expect(isRangeNumber([])).toBeFalsy();
      expect(isRangeNumber({})).toBeFalsy();
      expect(isRangeNumber('')).toBeFalsy();
      expect(isRangeNumber('test')).toBeFalsy();
      expect(isRangeNumber(false)).toBeFalsy();
      expect(isRangeNumber(true)).toBeFalsy();
      expect(isRangeNumber([3, 1])).toBeFalsy();
      expect(isRangeNumber(['one', 'five'])).toBeFalsy();
    });

    test('should return true if a range number', () => {
      expect(isRangeNumber([1, 3])).toBeTruthy();
      expect(isRangeNumber(['2', '4'])).toBeTruthy();
    });
  });

  describe('isValidDate', () => {
    class FakeDate {
      public getTime() {
        return 1651069701964;
      }
    }

    it('should validate input properly', () => {
      expect(isValidDate(null)).toBeFalsy();
      expect(isValidDate('test')).toBeFalsy();
      expect(isValidDate(new Date('getTimeWillReturnNaN'))).toBeFalsy();
      expect(isValidDate(new Date())).toBeTruthy();
      expect(isValidDate(new FakeDate())).toBeTruthy();
    });
  });

  describe('isValidDateInput', () => {
    class FakeDate {
      public toString() {
        return new Date().toString();
      }
    }

    it('should validate input properly', () => {
      expect(isValidDateInput(null)).toBeFalsy();
      expect(isValidDateInput('test')).toBeFalsy();
      expect(isValidDateInput(new Date('getTimeWillReturnNaN'))).toBeFalsy();
      expect(isValidDateInput(new Date())).toBeTruthy();
      expect(isValidDateInput(new FakeDate())).toBeTruthy();
      expect(isValidDateInput('2012-12-12')).toBeTruthy();
      expect(isValidDateInput(123456789)).toBeTruthy();
      expect(isValidDateInput(NaN)).toBeFalsy();
    });
  });

  describe('isValidDateRange', () => {
    it('should validate input properly', () => {
      expect(isValidDateRange(null)).toBeFalsy();
      expect(isValidDateRange('test')).toBeFalsy();
      expect(isValidDateRange([3, 1])).toBeFalsy();
      expect(isValidDateRange([1, NaN])).toBeFalsy();

      expect(isValidDateRange([1, 2])).toBeTruthy();
      expect(isValidDateRange(['2012-12-12', '2013-03-03'])).toBeTruthy();
      expect(isValidDateRange([new Date('2012-12-12'), new Date('2013-03-03')])).toBeTruthy();
    });
  });

  describe('isSupportedSimpleTypes', () => {
    it('should validate input properly', () => {
      expect(isSupportedSimpleTypes({random: 'object'})).toBeFalsy();
      expect(isSupportedSimpleTypes({})).toBeFalsy();
      expect(isSupportedSimpleTypes(['random', 'array'])).toBeFalsy();
      expect(isSupportedSimpleTypes([])).toBeFalsy();

      expect(isSupportedSimpleTypes(null)).toBeTruthy();
      expect(isSupportedSimpleTypes(undefined)).toBeTruthy();
      expect(isSupportedSimpleTypes(42)).toBeTruthy();
      expect(isSupportedSimpleTypes(0)).toBeTruthy();
      expect(isSupportedSimpleTypes('some text')).toBeTruthy();
      expect(isSupportedSimpleTypes('')).toBeTruthy();
      expect(isSupportedSimpleTypes(true)).toBeTruthy();
      expect(isSupportedSimpleTypes(false)).toBeTruthy();
      expect(isSupportedSimpleTypes(new Date())).toBeTruthy();
    });
  });

  describe('isString', () => {
    it('should validate input properly', () => {
      expect(isString({random: 'object'})).toBeFalsy();
      expect(isString({})).toBeFalsy();
      expect(isString(['random', 'array'])).toBeFalsy();
      expect(isString([])).toBeFalsy();
      expect(isString(null)).toBeFalsy();
      expect(isString(undefined)).toBeFalsy();
      expect(isString(42)).toBeFalsy();
      expect(isString(0)).toBeFalsy();
      expect(isString(true)).toBeFalsy();
      expect(isString(false)).toBeFalsy();
      expect(isString(new Date())).toBeFalsy();

      expect(isString('some text')).toBeTruthy();
      expect(isString('')).toBeTruthy();
    });
  });
});
