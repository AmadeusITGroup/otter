import type { Translation } from '@o3r/core';

/**
 * Translatable item
 */
export interface Translatable<T extends Translation> {
  /**
   * translations map
   */
  translations: T;
}
