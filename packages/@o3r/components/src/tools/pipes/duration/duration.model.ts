/** Time object to format duration */
export interface TimeUnit {
  /** character definining the time unit */
  formatCharacter: string;
  /** divider to get the time unit value */
  divider: number;
  /**
   * modulo for the time unit
   * If not provided, it will either use the immediatly higher unit time divider
   * or Number.MAX_SAFE_INTEGER for the highest one
   */
  modulo?: number;
}

/** const array of ordered measurement unit time from the highest unit to the lowest (days to seconds) */
export const defaultTimeUnits: TimeUnit[] = [
  {
    formatCharacter: 'd',
    divider: 3600 * 24
  },
  {
    formatCharacter: 'h',
    divider: 3600
  },
  {
    formatCharacter: 'm',
    divider: 60
  },
  {
    formatCharacter: 's',
    divider: 1
  }
];
