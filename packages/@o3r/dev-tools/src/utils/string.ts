/**
 * Specific padding for number
 * @deprecated You can use the one expose in `@ama-sdk/core`, will be removed in Otter v12.
 * @param val
 * @param digits
 */
export function pad(val: number, digits = 2): string {
  const str = `${val}`;
  return '0'.repeat(Math.max(0, digits - str.length)) + str;
}
