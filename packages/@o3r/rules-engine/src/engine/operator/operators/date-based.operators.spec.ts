import { executeOperator } from '..';
import {
  dateAfter,
  dateBefore,
  dateEquals,
  dateInNextMinutes,
  dateNotEquals,
  dateNotInNextMinutes,
  inRangeDate
} from './date-based.operators';

// TODO migrate to test found in other files
describe('Operators', () => {
  const millisecondsInADay = 24 * 3600 * 1000;
  const now = new Date();
  const tomorrow = new Date(new Date(now).setHours(0, 0, 0, 0) + millisecondsInADay);
  const yesterday = new Date(new Date(now).setHours(0, 0, 0, 0) - millisecondsInADay);
  const inTwoDays = new Date(new Date(now).setHours(0, 0, 0, 0) + 2 * millisecondsInADay);

  describe('inRangeDate', () => {
    it('should have a valid name', () => {
      expect(inRangeDate.name).toBe('inRangeDate');
    });

    it('should invalid when dates are invalid', () => {
      expect(() => executeOperator('invalid date' as any, [] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(null as any, [] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(now, ['invalid date'] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(now, ['invalid date', 'invalid date'], inRangeDate)).toThrow();
    });

    it('should correctly check date range', () => {
      expect(executeOperator(now, [yesterday, tomorrow], inRangeDate)).toBeTruthy();
      expect(executeOperator(now, [yesterday, yesterday], inRangeDate)).toBeFalsy();
      expect(executeOperator(now, [tomorrow, tomorrow], inRangeDate)).toBeFalsy();
      expect(executeOperator(now.getTime(), [yesterday.getTime(), tomorrow.getTime()], inRangeDate)).toBeTruthy();
      expect(executeOperator(now.getTime(), [tomorrow.getTime(), tomorrow.getTime()], inRangeDate)).toBeFalsy();
      expect(executeOperator('2000-01-01', ['1999-12-31', '2099-12-31'], inRangeDate)).toBeTruthy();
      expect(executeOperator('2000-01-01', ['2099-12-31', '3099-12-31'], inRangeDate)).toBeFalsy();
    });
  });

  describe('dateInNextMinutes', () => {
    it('should have a valid name', () => {
      expect(dateInNextMinutes.name).toBe('dateInNextMinutes');
    });

    it('should invalid when dates are invalid', () => {
      expect(() => executeOperator('invalid date' as any, [] as any, dateInNextMinutes)).toThrow();
      expect(() => executeOperator(null as any, [] as any, dateInNextMinutes)).toThrow();
      expect(() => executeOperator(yesterday, 'invalid date', dateInNextMinutes)).toThrow();
      expect(() => executeOperator(yesterday, -1, dateInNextMinutes)).toThrow();

    });

    it('should correctly check date in next minutes', () => {
      expect(executeOperator(tomorrow, (24 * 60 + 1), dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
      // for past events, the operator should return false
      expect(executeOperator(yesterday, 0, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();
      // range is from now to +24h but event is in two days. The operator returns false
      expect(executeOperator(inTwoDays, (24 * 60 + 1), dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();

    });

    it('should throw error when no operatorFactValues is provided', () => {
      expect(() => executeOperator(now, 5, dateInNextMinutes)).toThrow('No operatorFactValues. Unable to retrieve the current time.');
    });

    it('should correctly check the edge case of current time', () => {
      // Considering the exact current time as the leftDate, it should still be true if the range is 0 minutes
      expect(executeOperator(now, 0, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();

      // Considering the exact current time but with 1 minute in the future, it should be true
      expect(executeOperator(now, 1, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
    });

    it('should correctly check the edge case of exact target date time', () => {
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later from now
      expect(executeOperator(oneHourLater, 60, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();

      const oneMinuteLater = new Date(now.getTime() + 60 * 1000); // 1 minute later from now
      expect(executeOperator(oneMinuteLater, 1, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
    });

    it('should return false for dates just beyond the specified range', () => {
      const oneMinutePastTarget = new Date(new Date(now).setMinutes(now.getMinutes() + 6)); // 6 minutes from now
      expect(executeOperator(oneMinutePastTarget, 5, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();
    });

    it('should validate rhs as numbers', () => {
      expect(() => executeOperator(now, 'invalid' as any, dateInNextMinutes, {o3rCurrentTime: now.getTime()})).toThrow();
    });
  });

  describe('dateNotInNextMinutes', () => {
    it('should have a valid name', () => {
      expect(dateNotInNextMinutes.name).toBe('dateNotInNextMinutes');
    });

    it('should invalid when dates are invalid', () => {
      expect(() => executeOperator('invalid date' as any, 1, dateNotInNextMinutes)).toThrow();
      expect(() => executeOperator(null as any, 0, dateNotInNextMinutes)).toThrow();
      expect(() => executeOperator(now, 'invalid minutes' as any, dateNotInNextMinutes)).toThrow();
      expect(() => executeOperator(now, 7, dateNotInNextMinutes)).toThrow();
    });

    it('should correctly check date not in next minutes', () => {
      // event occuring tomorrow is not in 0 minutes from now
      expect(executeOperator(tomorrow, 0, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
      // event occuring in two days is not in 24h from now
      expect(executeOperator(inTwoDays, 24 * 60 + 1, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
      // event that occured yesterday is not in 10 minutes from now
      expect(executeOperator(yesterday, 10, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();
    });

    it('should throw error when no operatorFactValues is provided', () => {
      expect(() => executeOperator(now, 5, dateNotInNextMinutes)).toThrow('No operatorFactValues. Unable to retrieve the current time.');
    });

    it('should correctly check for events exactly at the edge of the range', () => {
      // Event occurring exactly 1 minute from now should return false, as it is within the range
      const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);
      expect(executeOperator(oneMinuteFromNow, 1, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();

      // Event occurring just after 1 minute from now should return true, as it is outside the range
      const slightlyAfterOneMinuteFromNow = new Date(oneMinuteFromNow.getTime() + 1);
      expect(executeOperator(slightlyAfterOneMinuteFromNow, 1, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
    });

    it('should return false for events within the specified range', () => {
      const halfHourFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      expect(executeOperator(halfHourFromNow, 60, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();
    });

    it('should validate rhs as numbers', () => {
      expect(() => executeOperator(now, 'invalid' as any, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toThrow();
    });
    it('should return true for events happening way into the future', () => {
      const nextYear = new Date(new Date().setFullYear(now.getFullYear() + 1));
      expect(executeOperator(nextYear, 60, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeTruthy();
    });

    it('should return false for dates way in the past', () => {
      const lastYear = new Date(new Date().setFullYear(now.getFullYear() - 1));
      expect(executeOperator(lastYear, 60, dateNotInNextMinutes, {o3rCurrentTime: now.getTime()})).toBeFalsy();
    });
  });

  describe('dateBefore', () => {
    it('should have a valid name', () => {
      expect(dateBefore.name).toBe('dateBefore');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, now, dateBefore)).toThrow();
      expect(() => executeOperator(null as any, now, dateBefore)).toThrow();
      expect(() => executeOperator(null as any, null, dateBefore)).toThrow();
      expect(() => executeOperator(now, 'invalid date' as any, dateBefore)).toThrow();
      expect(() => executeOperator(now, null, dateBefore)).toThrow();
    });

    it('should correctly identify when left hand date is before right hand date', () => {
      expect(executeOperator(now, tomorrow.toString(), dateBefore)).toBeTruthy();
      expect(executeOperator(now, tomorrow, dateBefore)).toBeTruthy();
      expect(executeOperator(now, yesterday.toString(), dateBefore)).toBeFalsy();
      expect(executeOperator(now, yesterday, dateBefore)).toBeFalsy();
      expect(executeOperator(now.getTime(), tomorrow.getTime(), dateBefore)).toBeTruthy();
      expect(executeOperator(now.getTime(), yesterday.getTime(), dateBefore)).toBeFalsy();
      expect(executeOperator('2002-02-02', '2012-12-12', dateBefore)).toBeTruthy();
      expect(executeOperator('2011-11-11', '2001-01-01', dateBefore)).toBeFalsy();
    });
  });

  describe('dateAfter', () => {
    it('should have a valid name', () => {
      expect(dateAfter.name).toBe('dateAfter');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, now, dateAfter)).toThrow();
      expect(() => executeOperator(null as any, now, dateAfter)).toThrow();
      expect(() => executeOperator(null as any, null, dateAfter)).toThrow();
      expect(() => executeOperator(now, 'invalid date' as any, dateAfter)).toThrow();
      expect(() => executeOperator(now, null, dateAfter)).toThrow();
    });

    it('should correctly identify left hand date is after the right one', () => {
      expect(executeOperator(now, tomorrow.toString(), dateAfter)).toBeFalsy();
      expect(executeOperator(now, tomorrow, dateAfter)).toBeFalsy();
      expect(executeOperator(now, yesterday.toString(), dateAfter)).toBeTruthy();
      expect(executeOperator(now, yesterday, dateAfter)).toBeTruthy();
      expect(executeOperator(now.getTime(), tomorrow.getTime(), dateAfter)).toBeFalsy();
      expect(executeOperator(now.getTime(), yesterday.getTime(), dateAfter)).toBeTruthy();
      expect(executeOperator('2002-02-02', '2012-12-12', dateAfter)).toBeFalsy();
      expect(executeOperator('2011-11-11', '2001-01-01', dateAfter)).toBeTruthy();
    });
  });

  describe('dateEquals', () => {
    it('should have a valid name', () => {
      expect(dateEquals.name).toBe('dateEquals');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, now, dateEquals)).toThrow();
      expect(() => executeOperator(null as any, now, dateEquals)).toThrow();
      expect(() => executeOperator(null as any, null, dateEquals)).toThrow();
      expect(() => executeOperator(now, 'invalid date' as any, dateEquals)).toThrow();
      expect(() => executeOperator(now, null, dateEquals)).toThrow();
    });

    it('should correctly identify equal dates and ignore time of the day', () => {
      const yesterdayLunchTime = new Date(yesterday.getTime() + millisecondsInADay / 2);

      expect(executeOperator(yesterday, yesterday.toString(), dateEquals)).toBeTruthy();
      expect(executeOperator(yesterday, yesterdayLunchTime, dateEquals)).toBeTruthy();
      expect(executeOperator(now, yesterday.toString(), dateEquals)).toBeFalsy();
      expect(executeOperator(now, tomorrow, dateEquals)).toBeFalsy();
      expect(executeOperator(new Date('2012-01-01T10:00').getTime(), new Date('2012-01-01T17:00').getTime(), dateEquals)).toBeTruthy();
      expect(executeOperator(new Date('2012-01-01T10:00').getTime(), new Date('2012-02-01T10:00').getTime(), dateEquals)).toBeFalsy();
      expect(executeOperator('2012-01-01T10:00', '2012-01-01T17:00', dateEquals)).toBeTruthy();
      expect(executeOperator('2012-01-01T10:00', '2012-02-01T10:00', dateEquals)).toBeFalsy();
    });
  });

  describe('dateNotEquals', () => {
    it('should have a valid name', () => {
      expect(dateNotEquals.name).toBe('dateNotEquals');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, now, dateNotEquals)).toThrow();
      expect(() => executeOperator(null as any, now, dateNotEquals)).toThrow();
      expect(() => executeOperator(null as any, null, dateNotEquals)).toThrow();
      expect(() => executeOperator(now, 'invalid date' as any, dateNotEquals)).toThrow();
      expect(() => executeOperator(now, null, dateNotEquals)).toThrow();
    });

    it('should correctly identify non equals date (ignoring time of the day)', () => {
      const yesterdayLunchTime = new Date(yesterday.getTime() + millisecondsInADay / 2);

      expect(executeOperator(yesterday, yesterday.toString(), dateNotEquals)).toBeFalsy();
      expect(executeOperator(yesterday, yesterdayLunchTime, dateNotEquals)).toBeFalsy();
      expect(executeOperator(now, yesterday.toString(), dateNotEquals)).toBeTruthy();
      expect(executeOperator(now, tomorrow, dateNotEquals)).toBeTruthy();
      expect(executeOperator(new Date('2012-01-01T10:00').getTime(), new Date('2012-01-01T17:00').getTime(), dateNotEquals)).toBeFalsy();
      expect(executeOperator(new Date('2012-01-01T10:00').getTime(), new Date('2012-02-01T10:00').getTime(), dateNotEquals)).toBeTruthy();
      expect(executeOperator('2012-01-01T10:00', '2012-01-01T17:00', dateNotEquals)).toBeFalsy();
      expect(executeOperator('2012-01-01T10:00', '2012-02-01T10:00', dateNotEquals)).toBeTruthy();
    });
  });
});
