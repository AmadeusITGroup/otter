import {
  utils
} from './date';

describe('DateTime', () => {
  it('should support timestamp', () => {
    const ts = Date.now();
    const dateUtils = new utils.DateTime(ts);

    expect(dateUtils.getTime()).toEqual(ts);
  });

  it('should support DateTime Utils', () => {
    const originalDate = new utils.DateTime(new Date());

    expect(new utils.DateTime(originalDate)).toEqual(originalDate);
  });

  it('should support a copy constructor', () => {
    const originalDate = new utils.DateTime(new Date());

    expect(new utils.DateTime(originalDate)).toEqual(originalDate);
  });

  it('should support json conversions', () => {
    const originalDate = new utils.DateTime(new Date());
    // eslint-disable-next-line unicorn/prefer-structured-clone -- we test the JSON conversion
    const jsonDate = JSON.parse(JSON.stringify(originalDate));

    expect(new utils.DateTime(jsonDate)).toEqual(originalDate);
  });

  it('should support date without time', () => {
    const date1 = '1988-06-07';

    const dateCompare = new Date(date1);

    expect((new utils.DateTime(date1))).toEqual(dateCompare);
  });

  it('should support datetime without timezone', () => {
    const date1 = '2015-03-25T12:00:00Z';
    const dateCompare = new Date('2015-03-25');
    dateCompare.setHours(12);
    dateCompare.setMinutes(0);

    const dateUtils = new utils.DateTime(date1);

    expect(dateUtils).toEqual(dateCompare);
  });

  it('should ignore timezone of datetime', () => {
    const date1 = '2015-03-25T12:00:00-02:00';
    const date2 = '2015-03-25T12:00:00+05:00';

    const dateCompare = new Date('2015-03-25T12:00:00Z');
    dateCompare.setHours(12);
    dateCompare.setMinutes(0);

    expect((new utils.DateTime(date1))).toEqual(dateCompare);
    expect((new utils.DateTime(date2))).toEqual(dateCompare);
  });

  it('should handle daylight change', () => {
    const dateStr1 = '2017-03-23T12:00:00Z';
    const dateStr2 = '2017-04-01T12:00:00Z';
    const date1 = new utils.DateTime(dateStr1);
    const date2 = new utils.DateTime(dateStr2);
    const compareDate1 = new Date(dateStr1);
    const compareDate2 = new Date(dateStr2);

    expect(date1.getTimezoneOffset() - date2.getTimezoneOffset()).toBe(compareDate1.getTimezoneOffset() - compareDate2.getTimezoneOffset());
  });
});

describe('Date', () => {
  it('should support timestamp', () => {
    const ts = Date.now();
    const dateUtils = new utils.Date(ts);

    expect(dateUtils.getTime()).toEqual(ts);
  });

  it('should support Date Utils', () => {
    const originalDate = new utils.Date(new Date());

    expect(new utils.Date(originalDate)).toEqual(originalDate);
  });

  it('should support a copy constructor', () => {
    const originalDate = new utils.Date(new Date());

    expect(new utils.Date(originalDate)).toEqual(originalDate);
  });

  it('should support json conversions', () => {
    const originalDate = new utils.Date(new Date());
    // eslint-disable-next-line unicorn/prefer-structured-clone -- we test the JSON conversion
    const jsonDate = JSON.parse(JSON.stringify(originalDate));

    expect(new utils.Date(jsonDate)).toEqual(originalDate);
  });

  it('should be converted to a Js DateTime', () => {
    const date1 = '1988-06-07';

    const dateCompare = (new utils.DateTime('1988-06-07T00:00:00Z'));

    expect((new utils.Date(date1))).toEqual(dateCompare);
  });
});
