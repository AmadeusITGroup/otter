import {isValidDateInput, isValidDateRange, numberValidator} from '../operator.helpers';
import {DateInput, Operator} from '../operator.interface';

/**
 * Check if a date variable is in a specified date range
 *
 * @title is between
 */
export const inRangeDate: Operator<Date, [DateInput, DateInput], DateInput> = {
  name: 'inRangeDate',
  evaluator: (date, [from, to]) => {
    const dateObject = new Date(date);
    return new Date(from) <= dateObject && new Date(to) >= dateObject;
  },
  validateLhs: isValidDateInput,
  validateRhs: isValidDateRange
};


/**
 * Check if the value of the variable is in the next x minutes
 *
 * @title is in next minutes
 *
 * @returns false for dates before `now` and for dates after `now` + `nextMinutes`, true for dates between `now` and `now` + `nextMinutes`
 */
export const dateInNextMinutes: Operator<Date, string | number, DateInput> = {
  name: 'dateInNextMinutes',
  evaluator: (leftDateInput, minutes, operatorFactValues) => {
    if (!operatorFactValues) {
      throw new Error('No operatorFactValues. Unable to retrieve the current time.');
    }
    if (typeof operatorFactValues.o3rCurrentTime !== 'number') {
      throw new Error('o3rCurrentTime value is not a number');
    }
    const currentTimeValue = operatorFactValues.o3rCurrentTime;
    return inRangeDate.evaluator(leftDateInput, [currentTimeValue, currentTimeValue + +minutes * 60000]);
  },
  factImplicitDependencies: ['o3rCurrentTime'],
  validateLhs: isValidDateInput,
  validateRhs: numberValidator
};

/**
 * Check if the value of the variable is not in the next x minutes
 *
 * @title is not in next minutes
 *
 * @returns false for dates before `now` and for dates between `now` and `now` + `nextMinutes`, true for dates after `now` + `nextMinutes`
 */
export const dateNotInNextMinutes: Operator<Date, string | number, DateInput> = {
  name: 'dateNotInNextMinutes',
  evaluator: (leftDateInput, minutes, operatorFactValues) => {
    if (!operatorFactValues) {
      throw new Error('No operatorFactValues. Unable to retrieve the current time.');
    }
    if (typeof operatorFactValues.o3rCurrentTime !== 'number') {
      throw new Error('o3rCurrentTime value is not a number');
    }
    const currentTimeValue = operatorFactValues.o3rCurrentTime;
    const now = new Date(currentTimeValue);
    const leftDate = new Date(leftDateInput);
    const targetDate = new Date(new Date(currentTimeValue).setMinutes(now.getMinutes() + +minutes));
    return leftDate >= now && leftDate > targetDate;
  },
  factImplicitDependencies: ['o3rCurrentTime'],
  validateLhs: isValidDateInput,
  validateRhs: numberValidator
};

/**
 * Check if a date variable is prior than a specified date
 *
 * @title is before
 */
export const dateBefore: Operator<Date, DateInput, DateInput> = {
  name: 'dateBefore',
  evaluator: (leftDate, rightDate) => {
    const firstDateTime = new Date(leftDate).setHours(0,0,0,0);
    const secondDateTime = new Date(rightDate).setHours(0,0,0,0);
    return firstDateTime < secondDateTime;
  },
  validateLhs: isValidDateInput,
  validateRhs: isValidDateInput
};

/**
 * Check if a date variable is posterior than a specified date
 *
 * @title is after
 */
export const dateAfter: Operator<Date, DateInput, DateInput> = {
  name: 'dateAfter',
  evaluator: (leftDate, rightDate) => {
    const firstDateTime = new Date(leftDate).setHours(0,0,0,0);
    const secondDateTime = new Date(rightDate).setHours(0,0,0,0);
    return firstDateTime > secondDateTime;
  },
  validateLhs: isValidDateInput,
  validateRhs: isValidDateInput
};

/**
 * Check if a date variable is the same as a specified date
 *
 * @title is equal to
 */
export const dateEquals: Operator<Date, DateInput, DateInput> = {
  name: 'dateEquals',
  evaluator: (leftDate, rightDate) => {
    const firstDateIgnoringHours = new Date(leftDate).setHours(0, 0, 0, 0);
    const secondDateIgnoringHours = new Date(rightDate).setHours(0, 0, 0, 0);
    return firstDateIgnoringHours === secondDateIgnoringHours;
  },
  validateLhs: isValidDateInput,
  validateRhs: isValidDateInput
};

/**
 * Check if a date variable is different from a specified date
 *
 * @title is not equal
 */
export const dateNotEquals: Operator<Date, DateInput, DateInput> = {
  name: 'dateNotEquals',
  evaluator: (leftDate, rightDate) => {
    const firstDateIgnoringHours = new Date(leftDate).setHours(0, 0, 0, 0);
    const secondDateIgnoringHours = new Date(rightDate).setHours(0, 0, 0, 0);
    return firstDateIgnoringHours !== secondDateIgnoringHours;
  },
  validateLhs: isValidDateInput,
  validateRhs: isValidDateInput
};

export const dateBasedOperators = [
  inRangeDate, dateInNextMinutes, dateNotInNextMinutes, dateAfter, dateBefore, dateEquals, dateNotEquals
];
