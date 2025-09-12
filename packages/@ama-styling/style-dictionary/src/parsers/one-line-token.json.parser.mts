import type {
  Parser,
} from 'style-dictionary/types';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  deflatten,
} from '../helpers/config-deflatten.helpers.mjs';

/**
 * Parser for Json file to allow the dot notation Token (ex: `a.b: {}` instead of `a: {b: {} }`)
 */
export const oneLineTokenJsonParser: Parser = {
  name: `${OTTER_NAME_PREFIX}/json-parser/one-line-token`,
  pattern: /\.json$/,
  parser: ({ contents }) => {
    const obj = JSON.parse(contents);
    if (obj.$schema) {
      delete obj.$schema;
    }
    return deflatten(obj);
  }
};
