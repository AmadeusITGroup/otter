import {utils} from '@dapi/sdk-core';

/**
 * Check if an object is a date
 *
 * @param obj
 */
export function isDate(obj: any) {
  return obj instanceof utils.DateTime || obj instanceof utils.Date;
}

/**
 * Check if an object is not an array or a date
 *
 * @param obj
 */
export function isObject(obj: any) {
  return obj instanceof Object && !Array.isArray(obj) && !isDate(obj);
}

/**
 * Return a new reference of the given object
 *
 * @param obj
 */
export function immutablePrimitive(obj: any) {
  if (Array.isArray(obj)) {
    return obj.slice();
  } else if (obj instanceof utils.DateTime) {
    return new utils.DateTime(obj);
  } else if (obj instanceof utils.Date) {
    return new utils.Date(obj);
  } else if (obj instanceof Object) {
    // eslint-disable-next-line no-use-before-define
    return deepFill(obj, obj);
  } else {
    return obj;
  }
}

/**
 * Deep fill of base object using source
 * It will do a deep merge of the objects, overriding arrays
 * All properties not present in source, but present in base, will remain
 *
 * @param base
 * @param source
 */
export function deepFill<T extends { [x: string]: any }>(base: T, source?: { [x: string]: any }): T {
  if (typeof source === 'undefined') {
    return deepFill(base, base);
  }
  if (!isObject(base)) {
    return immutablePrimitive(typeof source !== 'undefined' ? source : base);
  }
  const newObj = {...base};
  for (const key in base) {
    if (key in source && typeof base[key] === typeof source[key]) {
      const keyOfSource = source[key];
      newObj[key] = typeof keyOfSource === 'undefined' ? immutablePrimitive(base[key]) : deepFill(base[key], source[key]);
    } else {
      newObj[key] = immutablePrimitive(base[key]);
    }
  }

  // getting keys present in source and not present in base
  for (const key in source) {
    if (!(key in newObj)) {
      newObj[key as keyof T] = immutablePrimitive(source[key]);
    }
  }
  return newObj;
}
