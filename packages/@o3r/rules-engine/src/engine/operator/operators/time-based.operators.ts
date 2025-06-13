import {
  isValidTimeInput,
  isValidTimeRange,
} from '../operator.helpers';
import {
  Operator,
} from '../operator.interface';

/**
 * Check if the current time is between the specified start and end times
 * @title is between
 */
export const inRangeTime: Operator<string, [string, string]> = {
  name: 'inRangeTime',
  evaluator: (currentTime, [from, to]) => {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
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
