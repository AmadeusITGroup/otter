import {isRangeNumber, isString, isSupportedSimpleTypes, numberValidator} from '../operator.helpers';
import { Operator, SupportedSimpleTypes } from '../operator.interface';

/**
 * Check if any of the variable's value is equal to a specific value
 *
 * @title contains
 */
export const arrayContains: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'arrayContains',
  evaluator: (value, b) => value.indexOf(b) > -1,
  validateLhs: Array.isArray,
  validateRhs: isSupportedSimpleTypes
};


/**
 * Check if the specified text value is included in the text variable
 *
 * @title contains
 */
export const stringContains: Operator<string, string> = {
  name: 'stringContains',
  evaluator: (inputString, substring) => inputString.indexOf(substring) > -1,
  validateLhs: isString,
  validateRhs: isString
};

/**
 * Check if every value of the variable is different from a specific value
 *
 * @title does not contain
 */
export const notArrayContains: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'notArrayContains',
  evaluator: (array, value) => array.indexOf(value) === -1,
  validateLhs: Array.isArray,
  validateRhs: isSupportedSimpleTypes
};

/**
 * Check if the specified text value is not included in the text variable
 *
 * @title does not contain
 */
export const notStringContains: Operator<string, string> = {
  name: 'notStringContains',
  evaluator: (inputString, substring: any) => inputString.indexOf(substring) === -1,
  validateLhs: isString,
  validateRhs: isString
};

/**
 * Check if every value of the variable equals a specific value
 *
 * @title all equal to
 */
export const allEqual: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'allEqual',
  // eslint-disable-next-line eqeqeq
  evaluator: (array, value) => array.every((elementValue) => elementValue == value),
  validateLhs: Array.isArray,
  validateRhs: isSupportedSimpleTypes
};

/**
 * Check if every numerical value of the variable is greater than a specific value
 *
 * @title all >
 */
export const allGreater: Operator<SupportedSimpleTypes[], number | string> = {
  name: 'allGreater',
  evaluator: (array, value) => array.every((elementValue) => numberValidator(elementValue) && elementValue > value),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if every value of the variable is in a specific list
 *
 * @title all in
 */
export const allIn: Operator<SupportedSimpleTypes[], SupportedSimpleTypes[]> = {
  name: 'allIn',
  evaluator: (array, value) => array.every((elementValue) => value.indexOf(elementValue) > -1),
  validateLhs: Array.isArray,
  validateRhs: Array.isArray
};

/**
 * Check if every value of the variable is not in a specific list
 *
 * @title none in
 */
export const allNotIn: Operator<SupportedSimpleTypes[], SupportedSimpleTypes[]> = {
  name: 'allNotIn',
  evaluator: (array, value) => !array.some((elementValue) => value.indexOf(elementValue) > -1),
  validateLhs: Array.isArray,
  validateRhs: Array.isArray
};

/**
 * Check if every numerical value of the variable is lower than a specific value
 *
 * @title all <
 */
export const allLower: Operator<number[], number | string> = {
  name: 'allLower',
  evaluator: (arrayNumber, number) => arrayNumber.every((elementNumber) => elementNumber < number),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if every string value of the variable matches a specific pattern
 *
 * @title all match
 */
export const allMatch: Operator<string[], string> = {
  name: 'allMatch',
  evaluator: (array, inputString) => {
    const regExp = new RegExp(inputString);
    return array.every((elementValue) => regExp.test(elementValue));
  },
  validateLhs: Array.isArray,
  validateRhs: isString
};

/**
 * Check if every value of the variable is included in a specified range
 *
 * @title all between
 */
export const allRangeNumber: Operator<number[], [number | string, number | string]> = {
  name: 'allRangeNumber',
  evaluator: (rangeArray, [from, to]) =>
    rangeArray.every((elementValue) => elementValue >= from && elementValue <= to),
  validateLhs: Array.isArray,
  validateRhs: isRangeNumber
};

/**
 * Check if at least one of the values of the variable equals a specific value
 *
 * @title one equal to
 */
export const oneEquals: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'oneEquals',
  // eslint-disable-next-line eqeqeq
  evaluator: (array, value) => array.some((elementValue) => elementValue == value),
  validateLhs: Array.isArray,
  validateRhs: isSupportedSimpleTypes
};

/**
 * Check if one of the values of the variable is greater than a specific value
 *
 * @title one >
 */
export const oneGreater: Operator<number[], number | string> = {
  name: 'oneGreater',
  evaluator: (arrayNumber, number) => arrayNumber.some((elementValue) => elementValue > number),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if at least one of the values of the variable is equal to one in a specified list
 *
 * @title one in
 */
export const oneIn: Operator<SupportedSimpleTypes[], SupportedSimpleTypes[]> = {
  name: 'oneIn',
  evaluator: (firstArray, secondArray) =>
    firstArray.some((elementValue) => secondArray.indexOf(elementValue) > -1),
  validateLhs: Array.isArray,
  validateRhs: Array.isArray
};

/**
 * Check if one of the values of the variable is lower than a specific value
 *
 * @title one <
 */
export const oneLower: Operator<number[], number | string> = {
  name: 'oneLower',
  evaluator: (arrayNumber, number) => arrayNumber.some((elementValue) => elementValue < number),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if one of the values of the variable matches a specific pattern
 *
 * @title one matches
 */
export const oneMatches: Operator<string[], string> = {
  name: 'oneMatches',
  evaluator: (arrayString, value) => {
    const regExp = new RegExp(value);
    return arrayString.some((elementValue) => regExp.test(elementValue));
  },
  validateLhs: Array.isArray,
  validateRhs: isString
};

/**
 * Check if one of the values of the variable is included in a specified range
 *
 * @title one between
 */
export const oneRangeNumber: Operator<number[], [number | string, number | string]> = {
  name: 'oneRangeNumber',
  evaluator: (arrayNumber, [from, to]) =>
    arrayNumber.some((elementValue) => elementValue >= from && elementValue <= to),
  validateLhs: Array.isArray,
  validateRhs: isRangeNumber
};

/**
 * Check if the number of values of the variable is equal to a specific value
 *
 * @title number of =
 */
export const lengthEquals: Operator<any[], number | string> = {
  name: 'lengthEquals',
  evaluator: (array, length) => array.length === Number(length),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if the number of values of the variable is different from a specific value
 *
 * @title number of ≠
 */
export const lengthNotEquals: Operator<any[], number | string> = {
  name: 'lengthNotEquals',
  evaluator: (array, length) => array.length !== Number(length),
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if the number of values of the variable is lower or equal to a specific value
 *
 * @title number of ≤
 */
export const lengthLessThanOrEquals: Operator<any[], number | string> = {
  name: 'lengthLessThanOrEquals',
  evaluator: (array, length) => array.length <= length,
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if the number of values of the variable is lower than a specific value
 *
 * @title number of <
 */
export const lengthLessThan: Operator<any[], number | string> = {
  name: 'lengthLessThan',
  evaluator: (array, length) => array.length < length,
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if the number of values of the variable is greater or equal to a specific value
 *
 * @title number of ≥
 */
export const lengthGreaterThanOrEquals: Operator<any[], number | string> = {
  name: 'lengthGreaterThanOrEquals',
  evaluator: (array, length) => array.length >= length,
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/**
 * Check if the number of values of the variable is greater than a specific value
 *
 * @title number of >
 */
export const lengthGreaterThan: Operator<any[], number | string> = {
  name: 'lengthGreaterThan',
  evaluator: (array, length) => array.length > length,
  validateLhs: Array.isArray,
  validateRhs: numberValidator
};

/** List of all default array operators */
export const arrayBasedOperators = [
  allEqual,
  allGreater,
  allIn,
  allLower,
  allMatch,
  allNotIn,
  allRangeNumber,
  arrayContains,
  lengthEquals,
  lengthNotEquals,
  lengthGreaterThan,
  lengthGreaterThanOrEquals,
  lengthLessThan,
  lengthLessThanOrEquals,
  notArrayContains,
  notStringContains,
  oneEquals,
  oneGreater,
  oneIn,
  oneLower,
  oneMatches,
  oneRangeNumber,
  stringContains
];
