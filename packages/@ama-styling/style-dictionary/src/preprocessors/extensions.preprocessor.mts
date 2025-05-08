import type {
  PreprocessedTokens,
  Preprocessor,
  TransformedToken,
} from 'style-dictionary/types';
import {
  OTTER_EXTENSIONS_NODE_NAME,
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  DesignTokenExtensions,
} from '../interfaces/extensions.interface.mjs';

const isDesignToken = (token: PreprocessedTokens | TransformedToken, usesDtcg: boolean): token is TransformedToken => {
  return typeof (token.isSource ?? token[`${usesDtcg ? '$' : ''}value`]) !== 'undefined';
};

const mergeExtensions = (exts: DesignTokenExtensions[]): DesignTokenExtensions | undefined => {
  const extensions = exts.filter((e) => !!e);
  return extensions.length > 0
    ? extensions.reduce((acc, ext) => {
      return {
        ...acc,
        ...ext,
        o3rMetadata: acc?.o3rMetadata || ext?.o3rMetadata
          ? {
            ...acc?.o3rMetadata,
            ...ext?.o3rMetadata
          }
          : undefined
      };
    }, {} as DesignTokenExtensions)
    : undefined;
};

const getNode = (ext: any, path: string[]) => {
  const [node, ...tail] = path;
  if (!node) {
    return ext;
  }

  if (!ext || !ext[node]) {
    return undefined;
  }

  return getNode(ext[node], tail);
};

/**
 * The purpose of this function is to map Style Dictionary built-in supported properties to the corresponding Otter `$extensions` properties.
 * @param token Transformed token with Otter $extensions properties
 */
const convertOtterNotationToToken = (token: TransformedToken): TransformedToken => {
  token.themeable ??= token.attributes?.o3rExpectOverride as boolean | undefined;
  if (token.attributes) {
    token.attributes.private ??= token.attributes.o3rPrivate as boolean | undefined;
  }
  return token;
};

/**
 * Pre-processor to add the support of the `$extensions` instructions in the Token (or dedicated `extensions.json` file)
 */
export const extensionPropagatePreprocessor: Preprocessor = {
  name: `${OTTER_NAME_PREFIX}/pre-processor/extensions`,
  preprocessor: (dictionary, options) => {
    const usesDtcg: boolean = options.usesDtcg ?? true;
    const overrideExtensions = dictionary[OTTER_EXTENSIONS_NODE_NAME];
    if (dictionary[OTTER_EXTENSIONS_NODE_NAME]) {
      delete dictionary[OTTER_EXTENSIONS_NODE_NAME];
    }
    const rec = (token: PreprocessedTokens | TransformedToken, path: string[] = [], extensions?: DesignTokenExtensions): PreprocessedTokens | TransformedToken => {
      const overrideExtension = getNode(overrideExtensions, path)?.$extensions;
      if (isDesignToken(token, usesDtcg)) {
        token.attributes = mergeExtensions([token.attributes, ...(extensions ? [extensions] : []), overrideExtension, ...(usesDtcg ? [token.$extensions] : [])]) as Record<string, unknown>;
        return convertOtterNotationToToken(token);
      } else if (typeof token === 'object') {
        return Object.fromEntries(
          Object.entries(token)
            .map(([name, value]) => ([
              name,
              rec(value, [...path, name], mergeExtensions(usesDtcg ? [extensions, overrideExtension, (value as TransformedToken).$extensions] : [extensions, overrideExtension]))]))
        );
      } else {
        return token;
      }
    };
    return rec(dictionary);
  }
};
