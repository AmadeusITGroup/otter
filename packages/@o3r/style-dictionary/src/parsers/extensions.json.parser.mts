import type {
  Parser,
} from 'style-dictionary/types';
import {
  OTTER_EXTENSIONS_NODE_NAME,
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  deflatten,
} from '../helpers/config-deflatten.helpers.mjs';

/**
 * Parser for Json file to apply `$extensions` instructions on top of Design Token
 */
export const extensionsJsonParser: Parser = {
  name: `${OTTER_NAME_PREFIX}/json-parser/extensions`,
  pattern: /\.extensions\.json$/,
  parser: ({ contents }) => {
    const obj = JSON.parse(contents);
    if (obj.$schema) {
      delete obj.$schema;
    }
    return {
      [OTTER_EXTENSIONS_NODE_NAME]: deflatten(obj)
    };
  }
};
