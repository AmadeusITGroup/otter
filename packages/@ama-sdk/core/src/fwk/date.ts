// eslint-disable-next-line @typescript-eslint/naming-convention -- keep to not introduce breaking change
export type _NativeDate = Date;
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle -- keep to not introduce breaking change
export const _NativeDateClass = Date;

/**
 * Specific padding for number
 * @param val number
 * @param digits minimal number of digits to display
 */
export function pad(val: number, digits = 2): string {
  const str = `${val}`;
  return '0'.repeat(Math.max(0, digits - str.length)) + str;
}

/**
 * Compute the timezone after the first offset update in case the new date changes
 * to Summer or winter timezone
 * @param dateArgs
 * @param timezoneOffset
 */
function getNewTimeZoneWithOffset(dateArgs: any[], timezoneOffset: number) {
  const newDateArgs = [...dateArgs];
  newDateArgs[0] += `${timezoneOffset < 0 ? '+' : '-'}${pad(Math.floor(Math.abs(timezoneOffset / 60)))}:${pad(Math.abs(timezoneOffset % 60))}`;
  return newDateArgs;
}

/**
 * Compare 2 utils.Date, return negative if date1 is sooner, 0 if dates are equals, positive if date1 is later
 * This function is meant to be used with utils.Date and only compares Year, Month and Date, the time part is fully ignored.
 * @param date1
 * @param date2
 */
export function compareDates(date1: utils.Date, date2: utils.Date) {
  return date1.getFullYear() - date2.getFullYear() || date1.getMonth() - date2.getMonth() || date1.getDate() - date2.getDate();
}

/**
 * Removes timezone information from ISO8601 strings
 */
export class CommonDate extends Date {
  constructor(...args: any[]) {
    if (args && typeof args[0] === 'string') {
      const idxT = args[0].lastIndexOf('T');

      // TZD  = time zone designator (Z or +hh:mm or -hh:mm)
      let idx = args[0].lastIndexOf('Z');
      if (idx < 0) {
        idx = args[0].lastIndexOf('+');
      }
      if (idx < 0 && idxT > 0) {
        const relativeIdx = args[0].substring(idxT).lastIndexOf('-');
        idx = relativeIdx > 0 ? relativeIdx + idxT : relativeIdx;
      }
      if (idx > 0) {
        args[0] = args[0].substring(0, idx);
      }

      const ORIGINAL_TIME_ZONE_OFFSET = ((new (Date as any)(...args)) as Date).getTimezoneOffset();

      if (idxT > 0) {
        const newDateArgs = getNewTimeZoneWithOffset(args, ORIGINAL_TIME_ZONE_OFFSET);
        // Adjust timezone in case of a daylight saving change mid-offset
        const NEW_DATE_TIME_ZONE_OFFSET = ((new (Date as any)(...newDateArgs)) as Date).getTimezoneOffset();
        args = getNewTimeZoneWithOffset(args, NEW_DATE_TIME_ZONE_OFFSET);
      }
    }

    super(...(args as []));
  }

  /**
   * Overrides the JSON conversion to remove any timezone information.
   */
  public override toJSON(): string {
    return `${this.getFullYear()}-${pad(this.getMonth() + 1)}-${pad(this.getDate())}T${pad(this.getHours())}:${pad(this.getMinutes())}:${pad(this.getSeconds())}.${pad(this.getMilliseconds(), 3)}`;
  }
}

/**
 * A collection of utilities required by the auto-generated code.
 */
export namespace utils {
  'use strict';

  export class Date extends CommonDate {
    /**
     * Convert Date to JavaScript DateTime compatible entry
     */
    constructor(value?: number | string | _NativeDate | Date);
    constructor(year: number, month: number, date?: number);
    constructor(...args: any[]) {
      if (args && typeof args[0] === 'string' && !args[0].includes('T')) {
        args[0] = `${args[0]}T00:00:00Z`;
      } else if (args[0] instanceof _NativeDateClass) {
        args[0] = `${args[0].getFullYear()}-${pad(args[0].getMonth() + 1)}-${pad(args[0].getDate())}T00:00:00Z`;
      }

      super(...args);
    }

    /**
     * To ensure that users cannot use a standard Date instead of utils.Date
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- keep to not introduce breaking change
    protected _Date(): void {}

    /**
     * Overrides the JSON conversion to remove any time information.
     */
    public override toJSON(): string {
      return (`${this.getFullYear()}-${pad(this.getMonth() + 1)}-${pad(this.getDate())}`);
    }

    /**
     * Compare if two dates are equals.
     * @deprecated this will be removed in v14, please use {@link compareDates} instead
     * @param  {Date}    date the date to compare
     * @returns {boolean}      true if the dates are equals.
     */
    public equals(date?: Date): boolean {
      if (!date) {
        return false;
      }
      return this.getFullYear() === date.getFullYear() && this.getMonth() === date.getMonth() && this.getDate() === date.getDate();
    }
  }

  export class DateTime extends CommonDate {
    constructor(value?: number | string | _NativeDate | DateTime | Date);
    constructor(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number);
    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- type is explicitly `any`
      super(...args);
    }

    /**
     * To ensure that users cannot use a standard Date instead of utils.DateTime
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- keep to not introduce breaking change
    protected _DateTime(): void {}
  }
}
