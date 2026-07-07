/**
 * Check if input is of type {@link PerformanceNavigationTiming}
 * @param entry PerformanceEntry
 * @returns type indicator if {@link entry} meets the condition of {@link PerformanceNavigationTiming}
 */
export function isPerformanceNavigationEntry(entry: PerformanceEntry | undefined): entry is PerformanceNavigationTiming {
  return entry?.entryType === 'navigation';
}
