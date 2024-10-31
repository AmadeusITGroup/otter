import {
  DateInput,
  inRangeDate,
  UnaryOperator
} from '@o3r/rules-engine';

/**
 * Check if a date variable is during summer
 */
export const duringSummer: UnaryOperator<DateInput> = {
  name: 'duringSummer',
  evaluator: (date) => {
    const year = new Date(date).getFullYear();
    const startSummerDateTime = new Date(`${year}-06-21`).setHours(0, 0, 0, 0);
    const endSummerDateTime = new Date(`${year}-09-21`).setHours(0, 0, 0, 0);
    return inRangeDate.evaluator(date, [startSummerDateTime, endSummerDateTime]);
  },
  validateLhs: inRangeDate.validateLhs
};
