import {of} from 'rxjs';
import {executeOperator, numberValidator} from './operator.helpers';
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
      expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs');
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
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs');
      });

      test('with promise value', () => {
        const operator: Operator = {
          name: 'test',
          evaluator: jest.fn().mockReturnValue(Promise.resolve(true))
        };

        expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs');
      });

      test('with observable value', () => {
        const operator: Operator = {
          name: 'test',
          evaluator: jest.fn().mockReturnValue(of(true))
        };

        expect(executeOperator('testLhs', 'testRhs', operator)).toBeTruthy();
        expect(operator.evaluator).toHaveBeenCalledWith('testLhs', 'testRhs');
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
});
