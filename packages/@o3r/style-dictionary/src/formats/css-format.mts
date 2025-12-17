import type {
  Format,
} from 'style-dictionary/types';
import {
  fileHeader,
  sortByReference,
} from 'style-dictionary/utils';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import {
  sortByPath,
} from '../helpers/sort-by-path-sort-helpers.mjs';
import {
  getDefaultCssFormatter,
} from './css-formatters/default-formatter.mjs';
import type {
  FormatterOptions,
} from './css-formatters/interface-formatter.mjs';

export const cssFormat: Format = {
  name: `${OTTER_NAME_PREFIX}/css/variable`,
  format: async ({ dictionary, file, options }) => {
    const selector = options.selector || ':root';
    const { outputReferences: outRef, usesDtcg, formatting } = options;
    const outputReferences = outRef ?? true;
    const header: string = await fileHeader({ file, formatting, options });
    const { lineSeparator } = { lineSeparator: '\n', ...formatting };
    const format = 'css';
    const suffix = ';';
    const prefix = '--';
    const separator = ':';

    const baseFormatterOptions = {
      outputReferences,
      outputReferenceFallbacks: false,
      dictionary,
      format,
      formatting: {
        ...formatting,
        suffix,
        prefix,
        separator
      },
      themeable: false,
      usesDtcg
    } as const satisfies FormatterOptions;

    const formattedVariables = () => {
      const { allTokens, tokens, unfilteredTokens } = dictionary;
      const propertyFormatter = getDefaultCssFormatter(baseFormatterOptions);

      return [...allTokens]
        .toSorted(sortByPath)
        .toSorted(outputReferences ? sortByReference(tokens, { unfilteredTokens, usesDtcg }) : () => 0)
        .filter(({ attributes }) => !attributes?.private)
        .map((token) => ({
          token,
          strValue: propertyFormatter(token)
        }))
        .filter(({ strValue }) => !!strValue)
        .map(({ token, strValue }) => {
          if (token.attributes?.o3rImportant) {
            strValue = strValue.replace(new RegExp(suffix), ' !important' + suffix);
          }
          if (token.attributes?.o3rScope) {
            strValue = strValue.replace(/^(\s*)(.+)$/, `$1${token.attributes.o3rScope as string} { $2 }`);
          }
          return strValue;
        })
        .join(lineSeparator);
    };

    return header
      + `${selector} {${lineSeparator}`
      + formattedVariables()
      + `${lineSeparator}}${lineSeparator}`;
  }
};
