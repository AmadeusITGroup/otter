import type { Output } from '@o3r/core';
import type { Documentation } from '../interfaces';

/**
 * Represents a extractor
 */
export interface Extractor<T = Output> {
  /** Extracts an array of Output from a given Documentation */
  extract(documentation: Documentation): T[];
}
