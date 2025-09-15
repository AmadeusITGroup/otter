import type {
  RGBA,
} from '../../models';

/**
 * Determine if the value is of type {@link RGBA}
 * @param value
 */
export const isRGBA = (value: any): value is RGBA => {
  return typeof value === 'object'
    && typeof (value as RGBA).r === 'number'
    && typeof (value as RGBA).g === 'number'
    && typeof (value as RGBA).b === 'number'
    && typeof (value as RGBA).a === 'number';
};
