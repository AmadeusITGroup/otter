/**
 * Specific padding for number
 *
 * @param val
 * @param digits
 */
export function pad(val: number, digits = 2): string {
  const str = `${val}`;
  return '0'.repeat(Math.max(0, digits - str.length)) + str;
}
