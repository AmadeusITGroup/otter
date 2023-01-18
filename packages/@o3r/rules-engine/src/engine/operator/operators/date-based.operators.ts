import { Operator } from '../operator.interface';

/**
 * Verifies if the parameter is a valid date for the operator (getTime function available returning a number)
 *
 * @param operatorInput
 */
export const isValidDate = (operatorInput: any) => {
  if (!operatorInput || typeof operatorInput.getTime !== 'function') {
    return false;
  }
  const getTimeResult = operatorInput.getTime();
  return typeof getTimeResult === 'number' && !isNaN(getTimeResult);
};

/**
 * Check if a date variable is in a specified date range
 *
 * @title is between
 */
export const inRangeDate: Operator<Date, [string, string]> = {
  name: 'inRangeDate',
  evaluator: (date, [from, to]) => {
    const time = date.getTime();
    let result = true;
    result = result && (new Date(from).getTime() <= time);
    result = result && (new Date(to).getTime() >= time);
    return result;
  },
  validateLhs: (inputDate: any) => isValidDate(inputDate),
  validateRhs: (inputDateRange: any) => Array.isArray(inputDateRange) && inputDateRange.length === 2 && isValidDate(new Date(inputDateRange[0])) && isValidDate(new Date(inputDateRange[1]))
};

/**
 * Check if a date variable is prior than a specified date
 *
 * @title is before
 */
export const dateBefore: Operator<Date, Date | string> = {
  name: 'dateBefore',
  evaluator: (leftDate, rightDate: Date | string) => {
    const firstDateTime = new Date(leftDate.getTime()).setHours(0,0,0,0);
    const secondDateTime = isValidDate(rightDate) ? new Date((rightDate as Date).getTime()).setHours(0,0,0,0) :
      new Date(new Date(rightDate).getTime()).setHours(0,0,0,0);
    return firstDateTime < secondDateTime;
  },
  validateLhs: (inputLeftDate: any) => isValidDate(inputLeftDate),
  validateRhs: (inputRightDate: any) => isValidDate(inputRightDate) || !!inputRightDate && isValidDate(new Date(inputRightDate))
};

/**
 * Check if a date variable is posterior than a specified date
 *
 * @title is after
 */
export const dateAfter: Operator<Date, Date | string> = {
  name: 'dateAfter',
  evaluator: (leftDate, rightDate: Date | string) => {
    const firstDateTime = new Date(leftDate.getTime()).setHours(0,0,0,0);
    const secondDateTime = isValidDate(rightDate) ? new Date((rightDate as Date).getTime()).setHours(0,0,0,0) :
      new Date(rightDate).setHours(0,0,0,0);
    return firstDateTime > secondDateTime;
  },
  validateLhs: (inputLeftDate: any) => isValidDate(inputLeftDate),
  validateRhs: (inputRightDate: any) => isValidDate(inputRightDate) || !!inputRightDate && isValidDate(new Date(inputRightDate))
};

/**
 * Check if a date variable is the same as a specified date
 *
 * @title is equal to
 */
export const dateEquals: Operator<Date, Date | string> = {
  name: 'dateEquals',
  evaluator: (leftDate, rightDate: Date | string) => {
    const firstDateIgnoringHours = new Date(leftDate.getTime()).setHours(0, 0, 0, 0);
    const secondDateIgnoringHours = isValidDate(rightDate) ? new Date((rightDate as Date).getTime()).setHours(0, 0, 0, 0) :
      new Date(rightDate).setHours(0, 0, 0, 0);
    return firstDateIgnoringHours === secondDateIgnoringHours;
  },
  validateLhs: (inputLeftDate: any) => isValidDate(inputLeftDate),
  validateRhs: (inputRightDate: any) => isValidDate(inputRightDate) || !!inputRightDate && isValidDate(new Date(inputRightDate))
};

/**
 * Check if a date variable is different from a specified date
 *
 * @title is not equal
 */
export const dateNotEquals: Operator<Date, Date | string> = {
  name: 'dateNotEquals',
  evaluator: (leftDate, rightDate: Date | string) => {
    const firstDateIgnoringHours = new Date(leftDate.getTime()).setHours(0, 0, 0, 0);
    const secondDateIgnoringHours = isValidDate(rightDate) ?
      new Date((rightDate as Date).getTime()).setHours(0, 0, 0, 0) : new Date(rightDate).setHours(0, 0, 0, 0);
    return firstDateIgnoringHours !== secondDateIgnoringHours;
  },
  validateLhs: (inputLeftDate: any) => isValidDate(inputLeftDate),
  validateRhs: (inputRightDate: any) => isValidDate(inputRightDate) || !!inputRightDate && isValidDate(new Date(inputRightDate))
};

export const dateBasedOperators = [
  inRangeDate, dateAfter, dateBefore, dateEquals, dateNotEquals
];
