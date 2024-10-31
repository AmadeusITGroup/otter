import {
  AllConditions,
  BinaryOperation,
  NotCondition,
  OperandFact
} from '../structure';
import {
  isAllConditions,
  isAnyConditions,
  isConditionProperties,
  isNotCondition,
  isOperandFact,
  isOperandLiteral,
  isOperandRuntimeFact
} from './rule.helpers';

describe('Rule helpers', () => {
  describe('isConditionProperties', () => {
    test('should return false if not a condition', () => {
      expect(isConditionProperties([])).toBeFalsy();
      expect(isConditionProperties({})).toBeFalsy();
      expect(isConditionProperties('')).toBeFalsy();
      expect(isConditionProperties('test')).toBeFalsy();
      expect(isConditionProperties(false)).toBeFalsy();
      expect(isConditionProperties(true)).toBeFalsy();
    });

    test('should return true if a condition', () => {
      expect(isConditionProperties({
        operator: 'testOperator',
        lhs: {
          type: 'FACT',
          value: 'test'
        },
        rhs: {
          type: 'LITERAL',
          value: true
        }
      } as BinaryOperation)).toBeTruthy();
    });
  });

  describe('isOperandFact', () => {
    test('should return false if not a fact', () => {
      expect(isOperandFact([])).toBeFalsy();
      expect(isOperandFact({})).toBeFalsy();
      expect(isOperandFact('')).toBeFalsy();
      expect(isOperandFact('test')).toBeFalsy();
      expect(isOperandFact(false)).toBeFalsy();
      expect(isOperandFact(true)).toBeFalsy();
    });

    test('should return true if a fact operand', () => {
      expect(isOperandFact({
        type: 'FACT',
        value: 'testFact'
      } as OperandFact)).toBeTruthy();
    });
  });

  describe('isOperandInnerFact', () => {
    test('should return false if not a fact', () => {
      expect(isOperandRuntimeFact([])).toBeFalsy();
      expect(isOperandRuntimeFact({})).toBeFalsy();
      expect(isOperandRuntimeFact('')).toBeFalsy();
      expect(isOperandRuntimeFact('test')).toBeFalsy();
      expect(isOperandRuntimeFact(false)).toBeFalsy();
      expect(isOperandRuntimeFact(true)).toBeFalsy();
      expect(isOperandRuntimeFact({ type: 'FACT', value: 'testFact' } as OperandFact)).toBeFalsy();
    });

    test('should return true if an inner fact operand', () => {
      expect(isOperandRuntimeFact({
        type: 'RUNTIME_FACT',
        value: 'testFact'
      })).toBeTruthy();
    });
  });

  describe('isOperandValue', () => {
    test('should return false if not an operand', () => {
      expect(isOperandLiteral([])).toBeFalsy();
      expect(isOperandLiteral({})).toBeFalsy();
      expect(isOperandLiteral('')).toBeFalsy();
      expect(isOperandLiteral('test')).toBeFalsy();
      expect(isOperandLiteral(false)).toBeFalsy();
      expect(isOperandLiteral(true)).toBeFalsy();
    });

    test('should return true if an operand', () => {
      expect(isOperandLiteral({
        type: 'LITERAL',
        value: ''
      })).toBeTruthy();
    });
  });

  describe('isAllConditions', () => {
    test('should return false if not an all condition node', () => {
      expect(isAllConditions([])).toBeFalsy();
      expect(isAllConditions({})).toBeFalsy();
      expect(isAllConditions('')).toBeFalsy();
      expect(isAllConditions('test')).toBeFalsy();
      expect(isAllConditions(false)).toBeFalsy();
      expect(isAllConditions(true)).toBeFalsy();
      expect(isAnyConditions({ not: {} } as any)).toBeFalsy();
    });

    test('should return true if an all condition', () => {
      expect(isAllConditions({
        all: []
      } as AllConditions)).toBeTruthy();
    });
  });

  describe('isAnyConditions', () => {
    test('should return false if not an any condition node', () => {
      expect(isAnyConditions([])).toBeFalsy();
      expect(isAnyConditions({})).toBeFalsy();
      expect(isAnyConditions('')).toBeFalsy();
      expect(isAnyConditions('test')).toBeFalsy();
      expect(isAnyConditions(false)).toBeFalsy();
      expect(isAnyConditions(true)).toBeFalsy();
      expect(isAnyConditions({ all: [] } as any)).toBeFalsy();
      expect(isAnyConditions({ not: {} } as any)).toBeFalsy();
    });
  });

  describe('isNotConditions', () => {
    test('should return false if not an not condition node', () => {
      expect(isNotCondition([])).toBeFalsy();
      expect(isNotCondition({})).toBeFalsy();
      expect(isNotCondition('')).toBeFalsy();
      expect(isNotCondition('test')).toBeFalsy();
      expect(isNotCondition(false)).toBeFalsy();
      expect(isNotCondition(true)).toBeFalsy();
      expect(isNotCondition({ all: [] } as any)).toBeFalsy();
    });

    test('should return true if a not condition', () => {
      expect(isNotCondition({
        not: {}
      } as NotCondition)).toBeTruthy();
    });
  });
});
