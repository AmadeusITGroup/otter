import type {
  Format,
  TransformedToken,
} from 'style-dictionary/types';
import {
  getReferences,
  sortByReference,
} from 'style-dictionary/utils';
import {
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  CssMetadata,
  CssVariable,
  DesignTokenMetadata,
} from '../interfaces/metadata-interface.mjs';
import {
  getDefaultCssFormatter,
} from './css-formatters/default-formatter.mjs';
import type {
  FormatterOptions,
} from './css-formatters/interface-formatter.mjs';

export const metadataFormat: Format = {
  name: `${OTTER_NAME_PREFIX}/json/metadata`,
  format: ({ dictionary, options }) => {
    const { outputReferences: outRef, usesDtcg, formatting, keepPrivate } = options;
    const outputReferences = outRef ?? true;
    const format = 'css';
    const suffix = ';';
    const prefix = '--';
    const separator = ':';
    const commentStyle = options.formatting?.commentStyle ?? 'none';
    const indentation = options.formatting?.indentation ?? '';
    const { lineSeparator } = { lineSeparator: '\n', ...formatting };
    const baseFormatterOptions = {
      outputReferences,
      outputReferenceFallbacks: false,
      dictionary,
      format,
      formatting: {
        ...formatting,
        suffix,
        prefix,
        separator,
        indentation,
        commentStyle
      },
      themeable: false,
      usesDtcg
    } as const satisfies FormatterOptions;

    let allTokens = dictionary.allTokens;
    const tokens = dictionary.tokens;
    if (outputReferences) {
      allTokens = [...allTokens].toSorted(
        sortByReference(tokens, { unfilteredTokens: dictionary.unfilteredTokens, usesDtcg })
      );
    }

    const propertyFormatter = getDefaultCssFormatter(baseFormatterOptions);

    const getValueFromCssVariable = (strValue: string) => strValue.replace(new RegExp(`^.*?${separator}(.*)$`), '$1').trim();

    const getMetadataReferences = (token: TransformedToken): CssVariable[] | undefined => {
      const originalValue = usesDtcg ? token.original.$value : token.original.value;
      const refs = getReferences(originalValue, tokens);
      return refs
        .map((ref) => ({
          defaultValue: getValueFromCssVariable(propertyFormatter(ref)),
          name: ref.name,
          references: getMetadataReferences(ref)
        }));
    };

    const metadata = allTokens
      .filter(({ attributes }) => !!keepPrivate || !attributes?.private)
      .map((token) => ({
        token,
        strValue: propertyFormatter(token)
      }))
      .filter(({ strValue }) => !!strValue)
      .reduce((acc, { token, strValue }) => {
        const cssVariable: CssVariable = {
          name: token.name,
          description: token.$description || token.comment,
          type: (token.attributes?.category || token[`${usesDtcg ? '$' : ''}type`]) === 'color' ? 'color' : 'string',
          defaultValue: getValueFromCssVariable(strValue),
          references: getMetadataReferences(token),
          ...(token.attributes?.o3rMetadata as DesignTokenMetadata | undefined)
        };
        acc.variables[token.name] = cssVariable;
        return acc;
      }, { variables: {} } as CssMetadata);

    return JSON.stringify(metadata, null, indentation?.length || 2).replaceAll(/[\n\r]+/g, lineSeparator);
  }
};
