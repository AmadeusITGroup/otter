import {
  isString,
  isSupportedSimpleTypes,
  parseRegExp
} from '../operator.helpers';
import {
  Operator,
  SupportedSimpleTypes,
  UnaryOperator
} from '../operator.interface';

/**
 * Check if a variable is equal to a specific value
 * @title is equal to
 */
export const equals: Operator = {
  name: 'equals',
  // eslint-disable-next-line
  evaluator: (firstValue, secondValue) => firstValue == secondValue
};

/**
 * Check if a variable is different from a specific value
 * @title is not equal to
 */
export const notEquals: Operator = {
  name: 'notEquals',
  // eslint-disable-next-line eqeqeq
  evaluator: (firstValue, secondValue) => firstValue != secondValue
};

/**
 * Check if the variable's value is included in a specified list
 * @title is in
 */
export const inArray: Operator<SupportedSimpleTypes, SupportedSimpleTypes[]> = {
  name: 'inArray',
  evaluator: (value, array) => array.includes(value),
  validateLhs: isSupportedSimpleTypes,
  validateRhs: Array.isArray
};

/**
 * Check if the variable's value is not included in the value list
 * @title is not in
 */
export const notInArray: Operator<SupportedSimpleTypes, SupportedSimpleTypes[]> = {
  name: 'notInArray',
  evaluator: (value, array) => !array.includes(value),
  validateLhs: isSupportedSimpleTypes,
  validateRhs: Array.isArray
};

/**
 * Check if the text variable is part of the specified value
 * @title within
 */
export const inString: Operator<string, string> = {
  name: 'inString',
  evaluator: (value, inputString) => inputString.includes(value),
  validateLhs: isString,
  validateRhs: isString
};

/**
 * Check if the text variable is not part of the specified value
 * @title not within
 */
export const notInString: Operator<string, string> = {
  name: 'notInString',
  evaluator: (value, inputString) => !inputString.includes(value),
  validateLhs: isString,
  validateRhs: isString
};

/**
 * Check if the variable and its value are defined
 * @title is defined
 */
export const isDefined: UnaryOperator<any> = {
  name: 'isDefined',
  evaluator: (input) => input !== undefined && input !== null
};

/**
 * Check if the variable and its value are undefined
 * @title is not defined
 */
export const isUndefined: UnaryOperator<any> = {
  name: 'isUndefined',
  evaluator: (input) => input === undefined || input === null
};

/**
 * Check if the text variable matches the specified RegExp pattern
 * @title matches the pattern
 */
export const matchesPattern: Operator<string, string> = {
  name: 'matchesPattern',
  evaluator: (value, inputRegExp) => {
    const regExp = parseRegExp(inputRegExp);
    return regExp.test(value);
  },
  validateLhs: isString,
  validateRhs: isString
};

/** List of all default basic operators */
export const basicOperators = [
  equals, inArray, inString, isDefined, isUndefined, matchesPattern, notEquals, notInArray, notInString
];
