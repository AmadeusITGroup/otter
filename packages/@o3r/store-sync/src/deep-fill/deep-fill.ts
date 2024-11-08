import {
  utils,
} from '@ama-sdk/core';
import {
  deepFill,
  type PrimitiveReviverMapper,
} from '@o3r/core';

const mapper: PrimitiveReviverMapper[] = [
  {
    condition: (data) => data instanceof utils.DateTime,
    construct: (data) => new utils.DateTime(data)
  },
  {
    condition: (data) => data instanceof utils.Date,
    construct: (data) => new utils.Date(data)
  }
];

/**
 * Deep fill of base object using source
 * It will do a deep merge of the objects, overriding arrays
 * All properties not present in source, but present in base, will remain
 * @param base
 * @param source
 */
export function deepFillWithDate<T extends { [x: string]: any }>(base: T, source?: { [x: string]: any }): T {
  return deepFill(base, source, mapper);
}
