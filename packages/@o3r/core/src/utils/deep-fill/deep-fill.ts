/** Reviver Mapper to detect and create object on deepFill */
export interface PrimitiveReviverMapper<T = any> {
  /** Condition to fill to be determine as  */
  condition: (data: any) => boolean;

  /**
   * Construct the primitive type if needed
   * @param data to be constructed
   * @default {@see defaultConstruct}
   */
  construct?: (data: any) => T;
}

const defaultConstruct = (data: any) => data;

const isDate = (data: any) => data instanceof Date && !isNaN(data as any);

/**
 * Check if an object is not an array or a date
 * @param obj
 * @param additionalMappers
 */
export function isObject(obj: any, additionalMappers?: PrimitiveReviverMapper[]) {
  return obj instanceof Object && !Array.isArray(obj) && !additionalMappers?.some((mapper) => mapper.condition(obj)) && !isDate(obj);
}

/**
 * Return a new reference of the given object
 * @param obj
 * @param additionalMappers
 */
export function immutablePrimitive(obj: any, additionalMappers?: PrimitiveReviverMapper[]) {
  if (Array.isArray(obj)) {
    return obj.slice();
  }

  const matchingPrimitive = additionalMappers?.find((mapper) => mapper.condition(obj));
  const resolvedType = matchingPrimitive && ((matchingPrimitive.construct || defaultConstruct)(obj));
  if (resolvedType !== undefined) {
    return resolvedType;
  }
  if (isDate(obj)) {
    return new Date(obj);
  } else if (obj instanceof Object) {
    // eslint-disable-next-line no-use-before-define
    return deepFill(obj, obj, additionalMappers);
  } else {
    return obj;
  }
}

/**
 * Deep fill of base object using source
 * It will do a deep merge of the objects, overriding arrays
 * All properties not present in source, but present in base, will remain
 * @param base
 * @param source
 * @param additionalMappers Map of conditions of type mapper
 */
export function deepFill<T extends { [x: string]: any }>(base: T, source?: { [x: string]: any }, additionalMappers?: PrimitiveReviverMapper[]): T {
  if (typeof source === 'undefined') {
    return deepFill(base, base, additionalMappers);
  }
  if (!isObject(base, additionalMappers)) {
    return immutablePrimitive(typeof source === 'undefined' ? base : source, additionalMappers);
  }
  const newObj = { ...base };
  for (const key in base) {
    if (key in source && typeof base[key] === typeof source[key]) {
      const keyOfSource = source[key];
      newObj[key] = typeof keyOfSource === 'undefined' ? immutablePrimitive(base[key], additionalMappers) : deepFill(base[key], source[key], additionalMappers);
    } else {
      newObj[key] = immutablePrimitive(base[key], additionalMappers);
    }
  }

  // getting keys present in source and not present in base
  for (const key in source) {
    if (!(key in newObj)) {
      newObj[key as keyof T] = immutablePrimitive(source[key], additionalMappers);
    }
  }
  return newObj;
}
