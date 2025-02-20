import type {
  Format,
  TransformedToken,
} from 'style-dictionary/types';
import {
  createPropertyFormatter,
  fileHeader,
  getReferences,
  sortByReference,
} from 'style-dictionary/utils';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';

export const cssFormat: Format = {
  name: `${OTTER_NAME_PREFIX}/css/variable`,
  format: async ({ dictionary, file, options }) => {
    const selector = options.selector || ':root';
    const { outputReferences, usesDtcg, formatting } = options;
    const header: string = await fileHeader({ file, formatting, options });
    const { lineSeparator } = { lineSeparator: '\n', ...formatting };
    const format = 'css';
    const suffix = ';';
    const prefix = '--';
    const separator = ':';

    const formattedVariables = () => {
      let allTokens = dictionary.allTokens;
      const tokens = dictionary.tokens;
      if (outputReferences) {
        allTokens = [...allTokens].sort(
          sortByReference(tokens, { unfilteredTokens: dictionary.unfilteredTokens, usesDtcg })
        );
      }

      const propertyFormatter = createPropertyFormatter({
        outputReferences: outputReferences ?? true,
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
      });

      const replacePrivateTokenReferences = (token: TransformedToken, strValue: string): string => {
        const originalValue = usesDtcg ? token.original.$value : token.original.value;

        if (outputReferences) {
          const refs = getReferences(originalValue, dictionary.unfilteredTokens || tokens, options);
          const privateRefs = refs.filter((ref) => ref.attributes?.o3rPrivate);
          if (privateRefs.length > 0) {
            privateRefs.forEach((ref) => {
              const refValue = propertyFormatter(ref);
              strValue = strValue.replaceAll(`${prefix}${ref.name}`, `${prefix}${ref.name}, ${refValue.substring(refValue.indexOf(separator) + 1).trim()}`);
              strValue = replacePrivateTokenReferences(ref, strValue);
            });
          }
        }
        return strValue;
      };

      const privatePropertyFormatter = (token: TransformedToken) => {
        const strValue = propertyFormatter(token);
        return strValue && replacePrivateTokenReferences(token, strValue);
      };

      return allTokens
        .filter(({ attributes }) => !attributes?.private)
        .map((token) => ({
          token,
          strValue: privatePropertyFormatter(token)
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
