import {
  isValidTimeInput,
  isValidTimeRange,
} from '../operator-helpers';
import {
  Operator,
} from '../operator-interface';

/**
 * Check if the time variable is between the specified start and end times.
 *
 * This method also supports time ranges that cross midnight. For example,
 * a range from "23:00" to "02:00" will be true for an input like "00:30".
 * @title is between
 */
export const inRangeTime: Operator<string, [string, string]> = {
  name: 'inRangeTime',
  evaluator: (currentTime, [from, to]) => {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map((value) => +value);
      return hours * 60 + minutes;
    };

    const currentMinutes = parseTime(currentTime);
    const startMinutes = parseTime(from);
    const endMinutes = parseTime(to);

    return startMinutes <= endMinutes ? currentMinutes >= startMinutes && currentMinutes <= endMinutes : currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  },
  validateLhs: isValidTimeInput,
  validateRhs: isValidTimeRange
};

/** List of all default time-based operators */
export const timeBasedOperators = [
  inRangeTime
];
