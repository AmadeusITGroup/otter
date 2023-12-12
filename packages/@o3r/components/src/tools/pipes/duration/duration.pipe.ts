import {Pipe, PipeTransform} from '@angular/core';
import {defaultTimeUnits, TimeUnit} from './duration.model';

/**
 * Pad a number with zeroes
 * @param num
 * @param digits
 */
function padNum(num: number, digits: number) {
  let strNum = String(num);
  while (strNum.length < digits) {
    strNum = '0' + strNum;
  }
  return strNum;
}

/**
 * Converts a duration in seconds into the HH:mm format
 */
@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {

  /**
   * @param value the value in seconds
   * @param pattern the desired output format.
   * The pattern takes into account static format characters surrounded by braces
   *   {d} for days, {h} for hours, {m} for minutes and {s} for seconds.
   * It accepts a double unit time in case a padding is wanted {dd} outputs 05 for instance
   * Should respect the following pattern `/(\{h+\})|(\{m+\})/` (ex: `'{h}h{m}m'` outputs `0h2m`, `'{h}H{mm}'` `0H02` etc.)
   * @param timeUnits the units time to be used in this transformation. This can be used for custom units in the pattern like
   *  {
   *    formatCharacter: 'w',
   *    divider: 3600 * 24 * 7
   *  }
   * The above defines a week for {w}
   */
  public transform(value?: number, pattern = '{h}:{mm}', timeUnits: TimeUnit[] = defaultTimeUnits) {
    const val = value || 0;
    let modulo = Number.MAX_SAFE_INTEGER;

    const matches = timeUnits.reduce<{
      textMatch: string;
      timeUnit: TimeUnit;
    }[]>((result, unit) => {
      const regexp = new RegExp('({' + unit.formatCharacter + '+})', 'g');
      const match = regexp.exec(pattern);
      if (!match) {
        return result;
      }
      return result.concat({
        textMatch: match[0],
        timeUnit: unit
      });
    }, []);

    return matches.reduce((result, match) => {
      const matchedPatternToReplace = match.textMatch;
      const unit = match.timeUnit;
      const unitTimeValue = Math.floor(val % (unit.modulo || modulo) / unit.divider);
      const unitMatchLength = (matchedPatternToReplace.match(new RegExp(unit.formatCharacter, 'g')) || []).length;
      const padded = padNum(unitTimeValue, unitMatchLength);
      modulo = unitTimeValue > 0 ? unit.divider : modulo;
      return result.replace(matchedPatternToReplace, padded);
    }, pattern);

  }
}
