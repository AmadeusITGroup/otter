import { executeOperator } from '..';
import {
  dateAfter,
  dateBefore,
  dateEquals,
  dateNotEquals,
  inRangeDate, isValidDate
} from './date-based.operators';

class FakeDate {
  public getTime() {
    return 1651069701964;
  }
}

// TODO migrate to test found in other files
describe('Operators', () => {
  const millisecondsInADay = 24 * 3600 * 1000;
  const tomorrow = new Date(new Date().setHours(0, 0, 0, 0) + millisecondsInADay);
  const yesterday = new Date(new Date().setHours(0, 0, 0, 0) - millisecondsInADay);

  describe('inRangeDate', () => {
    it('should have a valid name', () => {
      expect(inRangeDate.name).toBe('inRangeDate');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, [] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(null as any, [] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(null as any, [] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(new Date(), ['invalid date'] as any, inRangeDate)).toThrow();
      expect(() => executeOperator(new Date(), ['invalid date', 'invalid date'], inRangeDate)).toThrow();
    });

    it('should correctly check date range', () => {
      expect(executeOperator(new Date(), [yesterday.toString(), tomorrow.toString()], inRangeDate)).toBeTruthy();
      expect(executeOperator(new Date(), [yesterday.toString(), yesterday.toString()], inRangeDate)).toBeFalsy();
      expect(executeOperator(new Date(), [tomorrow.toString(), tomorrow.toString()], inRangeDate)).toBeFalsy();
    });
  });

  describe('dateBefore', () => {
    it('should have a valid name', () => {
      expect(dateBefore.name).toBe('dateBefore');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, new Date(), dateBefore)).toThrow();
      expect(() => executeOperator(null as any, new Date(), dateBefore)).toThrow();
      expect(() => executeOperator(null as any, null, dateBefore)).toThrow();
      expect(() => executeOperator(new Date(), 'invalid date' as any, dateBefore)).toThrow();
      expect(() => executeOperator(new Date(), null, dateBefore)).toThrow();
    });

    it('should correctly identify when left hand date is before right hand date', () => {
      expect(executeOperator(new Date(), tomorrow.toString(), dateBefore)).toBeTruthy();
      expect(executeOperator(new Date(), tomorrow, dateBefore)).toBeTruthy();
      expect(executeOperator(new Date(), yesterday.toString(), dateBefore)).toBeFalsy();
      expect(executeOperator(new Date(), yesterday, dateBefore)).toBeFalsy();
    });
  });

  describe('dateAfter', () => {
    it('should have a valid name', () => {
      expect(dateAfter.name).toBe('dateAfter');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, new Date(), dateAfter)).toThrow();
      expect(() => executeOperator(null as any, new Date(), dateAfter)).toThrow();
      expect(() => executeOperator(null as any, null, dateAfter)).toThrow();
      expect(() => executeOperator(new Date(), 'invalid date' as any, dateAfter)).toThrow();
      expect(() => executeOperator(new Date(), null, dateAfter)).toThrow();
    });

    it('should correctly identify left hand date is after the right one', () => {
      expect(executeOperator(new Date(), tomorrow.toString(), dateAfter)).toBeFalsy();
      expect(executeOperator(new Date(), tomorrow, dateAfter)).toBeFalsy();
      expect(executeOperator(new Date(), yesterday.toString(), dateAfter)).toBeTruthy();
      expect(executeOperator(new Date(), yesterday, dateAfter)).toBeTruthy();
    });
  });

  describe('dateEquals', () => {
    it('should have a valid name', () => {
      expect(dateEquals.name).toBe('dateEquals');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, new Date(), dateEquals)).toThrow();
      expect(() => executeOperator(null as any, new Date(), dateEquals)).toThrow();
      expect(() => executeOperator(null as any, null, dateEquals)).toThrow();
      expect(() => executeOperator(new Date(), 'invalid date' as any, dateEquals)).toThrow();
      expect(() => executeOperator(new Date(), null, dateEquals)).toThrow();
    });

    it('should correctly identify equal dates and ignore time of the day', () => {
      const yesterdayLunchTime = new Date(yesterday.getTime() + millisecondsInADay / 2);

      expect(executeOperator(yesterday, yesterday.toString(), dateEquals)).toBeTruthy();
      expect(executeOperator(yesterday, yesterdayLunchTime, dateEquals)).toBeTruthy();
      expect(executeOperator(new Date(), yesterday.toString(), dateEquals)).toBeFalsy();
      expect(executeOperator(new Date(), tomorrow, dateEquals)).toBeFalsy();
    });
  });

  describe('dateNotEquals', () => {
    it('should have a valid name', () => {
      expect(dateNotEquals.name).toBe('dateNotEquals');
    });

    it('should invalid when dates is invalid', () => {
      expect(() => executeOperator('invalid date' as any, new Date(), dateNotEquals)).toThrow();
      expect(() => executeOperator(null as any, new Date(), dateNotEquals)).toThrow();
      expect(() => executeOperator(null as any, null, dateNotEquals)).toThrow();
      expect(() => executeOperator(new Date(), 'invalid date' as any, dateNotEquals)).toThrow();
      expect(() => executeOperator(new Date(), null, dateNotEquals)).toThrow();
    });

    it('should correctly identify non equals date (ignoring time of the day)', () => {
      const yesterdayLunchTime = new Date(yesterday.getTime() + millisecondsInADay / 2);

      expect(executeOperator(yesterday, yesterday.toString(), dateNotEquals)).toBeFalsy();
      expect(executeOperator(yesterday, yesterdayLunchTime, dateNotEquals)).toBeFalsy();
      expect(executeOperator(new Date(), yesterday.toString(), dateNotEquals)).toBeTruthy();
      expect(executeOperator(new Date(), tomorrow, dateNotEquals)).toBeTruthy();
    });
  });

  describe('isValidDate', () => {
    it('should validate input properly', () => {
      expect(isValidDate(null)).toBeFalsy();
      expect(isValidDate('test')).toBeFalsy();
      expect(isValidDate(new Date('getTimeWillReturnNaN'))).toBeFalsy();
      expect(isValidDate(new Date())).toBeTruthy();
      expect(isValidDate(new FakeDate())).toBeTruthy();
    });
  });
});
