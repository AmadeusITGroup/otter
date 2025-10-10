import {
  dump,
  load,
} from 'js-yaml';

type OpenAPIFormat = 'json' | 'yaml';

/**
 * Deserialize the content to object in JSON or YAML format
 * @param content
 * @returns
 */
export const deserialize = (content: string): { format: OpenAPIFormat; obj: any} => {
  try {
    return {
      format: 'json',
      obj: JSON.parse(content)
    };
  } catch {
    return {
      format: 'yaml',
      obj: load(content)
    };
  }
};

/**
 * Serialize the object to content in JSON or YAML format
 * @param format
 * @param obj
 * @returns
 */
export const serialize = (format: OpenAPIFormat, obj: any): string => {
  if (format === 'json') {
    return JSON.stringify(obj, null, 2);
  }
  return dump(obj);
}
