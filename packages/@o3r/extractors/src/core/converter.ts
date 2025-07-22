import type {
  Output,
} from '@o3r/core';

/**
 * Represents a converter from Output to a ISchema
 */
export interface Converter {
  /** Converts from an Output to another Output */
  convert(data: Output): Output;
}
