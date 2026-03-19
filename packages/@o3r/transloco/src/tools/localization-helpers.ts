/**
 * Formats a debug key string combining the translation key and its value.
 * Used across the localization service, pipe, and directive when debugMode is enabled.
 * @param key The translation key
 * @param value The translated value
 */
export function getDebugKey(key: string, value: string): string {
  return `${key} - ${value}`;
}
