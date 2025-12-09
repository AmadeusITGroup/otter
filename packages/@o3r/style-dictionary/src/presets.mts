import StyleDictionary from 'style-dictionary';
import type {
  Config,
} from 'style-dictionary/types';
import {
  cssFormat,
} from './formats/css-format.mjs';
import {
  metadataFormat,
} from './formats/metadata-format.mjs';
import {
  extensionsJsonParser,
} from './parsers/extensions-json-parser.mjs';
import {
  oneLineTokenJsonParser,
} from './parsers/one-line-token-json-parser.mjs';
import {
  extensionPropagatePreprocessor,
} from './preprocessors/extensions-preprocessor.mjs';
import {
  cssRecommendedTransformGroup,
} from './transform-groups/css-recommended-transform-group.mjs';
import {
  ratioTransform,
} from './transforms/ratio-transform.mjs';
import {
  unitTransform,
} from './transforms/unit-transform.mjs';

/**
 * Register Otter hooks
 * @param styleDictionary
 */
export const register = (styleDictionary?: StyleDictionary) => {
  const sd = styleDictionary || StyleDictionary;
  sd.registerFormat(cssFormat);
  sd.registerFormat(metadataFormat);
  sd.registerParser(extensionsJsonParser);
  sd.registerParser(oneLineTokenJsonParser);
  sd.registerPreprocessor(extensionPropagatePreprocessor);
  sd.registerTransform(ratioTransform);
  sd.registerTransform(unitTransform);
  sd.registerTransformGroup(cssRecommendedTransformGroup);
};

/** Base configuration for Otter Extension */
export const baseConfig = {
  preprocessors: ['o3r/pre-processor/extensions'],
  parsers: [
    'o3r/json-parser/one-line-token',
    'o3r/json-parser/extensions'
  ]
} as const satisfies Config;
