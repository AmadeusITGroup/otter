import { numberValidator } from '../operator.helpers';
import { Operator } from '../operator.interface';

/**
 * Check if the number variable is greater or equal to a specific value
 *
 * @title ≥
 */
export const greaterThanOrEqual: Operator<number, number | string, number | string> = {
  name: 'greaterThanOrEqual',
  evaluator: (firstNumber, secondNumber) => firstNumber >= secondNumber,
  validateLhs: numberValidator,
  validateRhs: numberValidator
};

/**
 * Check if the number variable is greater than a specific value
 *
 * @title >
 */
export const greaterThan: Operator<number, number | string, number | string> = {
  name: 'greaterThan',
  evaluator: (firstNumber, secondNumber) => firstNumber > secondNumber,
  validateLhs: numberValidator,
  validateRhs: numberValidator
};

/**
 * Check if the number variable is lower or equal to a specific value
 *
 * @title ≤
 */
export const lessOrEqual: Operator<number, number | string, number | string> = {
  name: 'lessOrEqual',
  evaluator: (firstNumber, secondNumber) => firstNumber <= secondNumber,
  validateLhs: numberValidator,
  validateRhs: numberValidator
};

/**
 * Check if the number variable is lower than a specific value
 *
 * @title <
 */
export const lessThan: Operator<number, number | string, number | string> = {
  name: 'lessThan',
  evaluator: (firstNumber, secondNumber) => firstNumber < secondNumber,
  validateLhs: numberValidator,
  validateRhs: numberValidator
};

/** List of all default number based operators */
export const numberBasedOperators = [greaterThan, greaterThanOrEqual, lessThan, lessOrEqual];
