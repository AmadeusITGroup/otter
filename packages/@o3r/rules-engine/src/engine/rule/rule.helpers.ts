import {
  AllConditions,
  AnyConditions,
  BinaryOperation,
  NotCondition,
  Operand,
  OperandFact,
  UnaryOperation
} from '../structure';

/**
 * Determine if the condition is a properties condition
 *
 * @param condition Condition to analyze
 */
export function isConditionProperties(condition: any): condition is BinaryOperation | UnaryOperation {
  return condition && typeof condition.operator !== 'undefined' && typeof condition.lhs !== 'undefined';
}

/**
 * Determine if the given operand is a Fact operand
 *
 * @param operand Operand to analyze
 */
export function isOperandFact(operand: any): operand is OperandFact {
  return operand && operand.type === 'FACT';
}

/**
 * Determine if the given operand is a Inner Fact operand
 *
 * @param operand Operand to analyze
 */
export function isOperandRuntimeFact(operand: any): operand is Operand<'RUNTIME_FACT', string> {
  return operand && operand.type === 'RUNTIME_FACT';
}

/**
 * Determine if the given operand is a Static Value operand
 *
 * @param operand Operand to analyze
 */
export function isOperandLiteral(operand: any): operand is Operand<'LITERAL'> {
  return operand && operand.type === 'LITERAL';
}

/**
 * Determine if the given condition is All based child conditions
 *
 * @param condition Condition node
 */
export function isAllConditions(condition: any): condition is AllConditions {
  return condition && typeof condition.all !== 'undefined';
}

/**
 * Determine if the given condition is Any based child conditions
 *
 * @param condition Condition node
 */
export function isAnyConditions(condition: any): condition is AnyConditions {
  return condition && typeof condition.any !== 'undefined';
}

/**
 * Determine if the given condition is Not based child conditions
 *
 * @param condition Condition node
 */
export function isNotCondition(condition: any): condition is NotCondition {
  return condition && typeof condition.not !== 'undefined';
}
