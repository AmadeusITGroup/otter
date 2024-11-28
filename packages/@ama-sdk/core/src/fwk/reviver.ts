import type {
  Logger,
} from './logger';

/** Options provided to the reviver */
export interface ReviverOptions {
  /**
   * Logger to use to report reviving messages
   * @default console
   */
  logger?: Logger;

  /**
   * Determine if the fields from dictionary should be removed from the given object.
   * This options affects dictionary fields only if no dictionary is provided to the reviver function
   * @default false
   * @example Clear Dictionary fields from Data object
   * ```typescript
   * // Revived Data:
   * const revivedData = reviveMyModel<MyModel>(data, myDictionary);
   *
   * // Remove dictionary from revived data :
   * reviveMyModel(revivedData, undefined, { clearDictionaryFields: true });
   * ```
   */
  clearDictionaryFields?: boolean;
}

/** Reviver type */
export type ReviverType<T, V extends { [key: string]: any } = { [key: string]: any }, D extends { [key: string]: any } = { [key: string]: any }> =
  (data: V, dictionary?: D, options?: ReviverOptions) => T | undefined;

/**
 * Used in case of maps (dictionaries): All values of the map must be of the same type. reviveWithType will be called
 * for each of these elements.
 * @param data
 * @param dictionaries
 * @param reviver
 * @param options Reviver options
 */
export function reviveMap<T>(data: { [key: string]: any }, dictionaries: any = null, reviver: ReviverType<T>, options?: ReviverOptions) {
  if (!data) {
    return undefined;
  }

  const revived: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      revived[key] = reviver(data[key], dictionaries, options);
    }
  }

  return revived;
}

/**
 * Used in case of arrays: It will call the reviveWithType for each element of the array.
 * @param data
 * @param dictionaries
 * @param reviver
 * @param options Reviver options
 */
export function reviveArray<T>(data: any[], dictionaries: any = null, reviver: ReviverType<T>, options?: ReviverOptions) {
  if (!data) {
    return undefined;
  }
  for (let i = 0; i < data.length; i++) {
    data[i] = reviver(data[i], dictionaries, options);
  }
  return data as T[];
}

/**
 * Used in case of arrays dictionarized Array
 * @param ids : list of the ids to be able to get the associated values from the dictionary
 * @param dictionary : Specific dictionary associated to T
 * @param reviver : Function to revive the Data object, once retrieved from the dictionary.
 * If not passed as argument, the map entry won't be revived
 * @param options Reviver options
 * @returns Map of id : {revived dictionarized item}
 */
export function reviveDictionarizedArray<T>(ids: string[], dictionary: any, reviver?: ReviverType<T>, options?: ReviverOptions) {
  if (!ids) {
    return undefined;
  }
  return ids.reduce<{ [key: string]: T | undefined }>((map, id) => {
    map[id] = reviver ? reviver(dictionary[id], dictionary, options) : dictionary[id];
    return map;
  }, {});
}
