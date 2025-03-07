import {
  getReferences,
} from 'style-dictionary/utils';
import type {
  ChainFormatter,
  FormatterFactory,
  FormatterOptions,
} from './interface.formatter.mjs';

/**
 * Retrieve a formatter for a private Token
 * @param options Option of private formatter generator
 */
export const createPrivateFormatter: FormatterFactory = (options: FormatterOptions) => {
  const tokens = options.dictionary.tokens;
  const prefix = options.formatting?.prefix ?? '--';
  const separator = options.formatting?.separator ?? ':';
  const suffix = options.formatting?.suffix ?? ';';

  const replacePrivateTokenReferences: ChainFormatter = (token, str) => {
    if (!str) {
      return '';
    }

    let strValue = str;
    const originalValue = options.usesDtcg ? token.original.$value : token.original.value;

    if (options.outputReferences && options.formatter) {
      const refs = getReferences(originalValue, options.dictionary.unfilteredTokens || tokens, options);
      const privateRefs = refs.filter((ref) => ref.attributes?.o3rPrivate);
      if (privateRefs.length > 0) {
        privateRefs.forEach((ref) => {
          const refValue = options.formatter!(ref);
          const suffixIdx = refValue.indexOf(suffix);
          strValue = strValue.replaceAll(`${prefix}${ref.name}`, `${prefix}${ref.name}, ${refValue.substring(refValue.indexOf(separator) + 1, suffixIdx === -1 ? undefined : suffixIdx).trim()}`);
          strValue = replacePrivateTokenReferences(ref, strValue);
        });
      }
    }
    return strValue;
  };

  return replacePrivateTokenReferences;
};
