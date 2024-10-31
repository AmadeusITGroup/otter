import type {
  DesignToken,
  DesignTokenContext,
  DesignTokenExtensions,
  DesignTokenGroup,
  DesignTokenGroupExtensions,
  DesignTokenGroupTemplate,
  DesignTokenMetadata,
  DesignTokenNode,
  DesignTokenSpecification
} from '../design-token-specification.interface';
import {
  DesignTokenTypeStrokeStyleValue,
  isDesignToken,
  isDesignTokenGroup,
  isTokenTypeStrokeStyleValueComplex
} from '../design-token-specification.interface';
import type {
  DesignTokenVariableSet,
  DesignTokenVariableStructure,
  NodeReference,
  ParentReference
} from './design-token-parser.interface';

const tokenReferenceRegExp = /{([^}]+)}/g;
const splitValueNumericRegExp = /^([+-]?\d+[,.]?\d*)\s*([^\s,.;]+)?/;

const getTokenReferenceName = (tokenName: string, parents: string[]) => parents.join('.') + (parents.length > 0 ? '.' : '') + tokenName;
const getExtensions = (nodes: NodeReference[], context: DesignTokenContext | undefined) => {
  return nodes.reduce((acc, { tokenNode }, i) => {
    const nodeNames = nodes.slice(0, i + 1).map(({ name }) => name);
    const defaultMetadata = nodeNames.length > 0
      ? nodeNames.reduce((accTplList, name) =>
        accTplList
          .flatMap((accTpl) => ([accTpl[name], accTpl['*']] as (DesignTokenGroupTemplate | undefined)[]))
          .filter((accTpl): accTpl is DesignTokenGroupTemplate => !!accTpl)
      , context?.template ? [context.template] : [])
      : undefined;
    const o3rMetadata = {
      ...defaultMetadata?.reduce((accNode: DesignTokenMetadata, node) => ({ ...accNode, ...node.$extensions?.o3rMetadata }), {}),
      ...acc.o3rMetadata,
      ...tokenNode.$extensions?.o3rMetadata
    };
    return ({
      ...acc,
      ...defaultMetadata?.reduce((accNode, node) => ({ ...accNode, ...node.$extensions }), acc),
      ...tokenNode.$extensions, o3rMetadata
    });
  }, {} as DesignTokenGroupExtensions & DesignTokenExtensions);
};
const getReferences = (cssRawValue: string) => Array.from(cssRawValue.matchAll(tokenReferenceRegExp)).map(([,tokenRef]) => tokenRef);
const applyConversion = (token: DesignTokenVariableStructure, value: string) => {
  if (typeof token.extensions.o3rUnit === 'undefined' || typeof token.extensions.o3rRatio === 'undefined') {
    return value;
  }

  const splitValue = splitValueNumericRegExp.exec(value);
  if (!splitValue) {
    return value;
  }

  const [, floatValue, unit] = splitValue;

  const newValue = value.replace(floatValue, (Number.parseFloat((Number.parseFloat(floatValue) * token.extensions.o3rRatio).toFixed(3))).toString());

  if (unit) {
    return newValue.replace(unit, token.extensions.o3rUnit);
  }

  if (floatValue === value) {
    return newValue + token.extensions.o3rUnit;
  }

  return newValue;
};
const renderCssTypeStrokeStyleValue = (value: DesignTokenTypeStrokeStyleValue) => isTokenTypeStrokeStyleValueComplex(value) ? `${value.lineCap} ${value.dashArray.join(' ')}` : value;
const sanitizeStringValue = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const sanitizeKeyName = (name: string) => name.replace(/[ .]+/g, '-').replace(/[()[\]]+/g, '');
const getCssRawValue = (variableSet: DesignTokenVariableSet, token: DesignTokenVariableStructure) => {
  const { node, getType } = token;
  const nodeType = getType(variableSet, false);
  if (!nodeType && node.$value) {
    return typeof node.$value.toString === 'undefined' ? JSON.stringify(node.$value) : (node.$value as any).toString();
  }
  const checkNode = {
    ...node,
    $type: node.$type || nodeType
  } as typeof node;

  switch (checkNode.$type) {
    case 'string': {
      return `"${applyConversion(token, sanitizeStringValue(checkNode.$value.toString()))}"`;
    }
    case 'color':
    case 'number':
    case 'duration':
    case 'fontWeight':
    case 'fontFamily':
    case 'dimension': {
      return applyConversion(token, checkNode.$value.toString());
    }
    case 'strokeStyle': {
      return renderCssTypeStrokeStyleValue(checkNode.$value);
    }
    case 'cubicBezier': {
      return typeof checkNode.$value === 'string'
        ? checkNode.$value
        : checkNode.$value
          .map((value) => applyConversion(token, value.toString()))
          .join(', ');
    }
    case 'border': {
      return typeof checkNode.$value === 'string'
        ? checkNode.$value
        : `${applyConversion(token, checkNode.$value.width)} ${renderCssTypeStrokeStyleValue(checkNode.$value.style)} ${checkNode.$value.color}`;
    }
    case 'gradient': {
      if (typeof checkNode.$value === 'string') {
        return checkNode.$value;
      }
      const angle = typeof checkNode.$value.angle === 'number' ? checkNode.$value.angle + 'deg' : checkNode.$value.angle;
      return `${checkNode.$value.type || 'linear'}-gradient(${angle || '0deg'}, ${checkNode.$value.stops
        ?.map(({ color, position }) => `${color} ${typeof position === 'number' ? position + '%' : position}`)
        .join(', ')})`;
    }
    case 'shadow': {
      if (typeof checkNode.$value === 'string') {
        return checkNode.$value;
      }

      const values = Array.isArray(checkNode.$value) ? checkNode.$value : [checkNode.$value];
      return values
        .map((value) => `${applyConversion(token, value.offsetX)} ${applyConversion(token, value.offsetY)} ${applyConversion(token, value.blur)}  ${applyConversion(token, value.spread)}`
        + ` ${value.color}`)
        .join(', ');
    }
    case 'transition': {
      return typeof checkNode.$value === 'string'
        ? checkNode.$value
        : (typeof checkNode.$value.timingFunction === 'string'
          ? checkNode.$value.timingFunction
          : checkNode.$value.timingFunction.join(' ')
          + ` ${applyConversion(token, checkNode.$value.duration)} ${applyConversion(token, checkNode.$value.delay)}`);
    }
    case 'typography': {
      return typeof checkNode.$value === 'string'
        ? checkNode.$value
        : `${applyConversion(token, checkNode.$value.fontWeight.toString())} ${checkNode.$value.fontFamily}`
        + ` ${applyConversion(token, checkNode.$value.fontSize)} ${applyConversion(token, checkNode.$value.letterSpacing)} ${applyConversion(token, checkNode.$value.lineHeight.toString())}`;
    }
    // TODO: Add support for Grid type when available in the Design Token Standard
    default: {
      throw new Error(`Not supported type ${(checkNode as any).$type || 'unknown'} (value: ${(checkNode as any).$value || 'unknown'})`);
    }
  }
};

const walkThroughDesignTokenNodes = (
  node: DesignTokenNode,
  context: DesignTokenContext | undefined,
  ancestors: ParentReference[],
  mem: DesignTokenVariableSet,
  nodeName?: string): DesignTokenVariableSet => {
  if (isDesignTokenGroup(node)) {
    Object.entries(node)
      .filter(([tokenName, tokenNode]) => !tokenName.startsWith('$') && (isDesignToken(tokenNode) || isDesignTokenGroup(tokenNode)))
      .forEach(([tokenName, tokenNode]) => walkThroughDesignTokenNodes(
        tokenNode as DesignTokenGroup | DesignToken, context, nodeName ? [...ancestors, { name: nodeName, tokenNode: node }] : ancestors, mem, tokenName
      ));
  }

  if (isDesignToken(node)) {
    if (!nodeName) {
      throw new Error('The first node of the Design Specification can not be a token');
    }
    const parentNames = ancestors.map(({ name }) => name);
    const tokenReferenceName = getTokenReferenceName(nodeName, parentNames);

    const tokenVariable: DesignTokenVariableStructure = {
      context,
      extensions: getExtensions([...ancestors, { name: nodeName, tokenNode: node }], context),
      node,
      tokenReferenceName,
      ancestors,
      parent: ancestors.at(-1),
      description: node.$description,
      getCssRawValue: function (variableSet = mem) {
        return getCssRawValue(variableSet, this);
      },
      getReferences: function (variableSet = mem) {
        return getReferences(this.getCssRawValue(variableSet));
      },
      getIsAlias: function (variableSet = mem) {
        return this.getReferences(variableSet).length === 1 && typeof node.$value === 'string' && !!node.$value?.toString().match(/^{[^}]*}$/);
      },
      getReferencesNode: function (variableSet = mem) {
        return this.getReferences(variableSet)
          .filter((ref) => variableSet.has(ref))
          .map((ref) => variableSet.get(ref)!);
      },
      getType: function (variableSet = mem, followReference = true) {
        return node.$type
          || followReference && this.getIsAlias(variableSet) && this.getReferencesNode(variableSet)[0]?.getType(variableSet, followReference)
          || followReference && this.parent?.name && variableSet.get(this.parent.name)?.getType(variableSet, followReference)
          || undefined;
      },
      getKey: function (keyRenderer) {
        return keyRenderer ? keyRenderer(this) : sanitizeKeyName(this.tokenReferenceName);
      }
    };

    mem.set(tokenReferenceName, tokenVariable);
  } else if (!isDesignTokenGroup(node)) {
    throw new Error('Fail to determine the Design Token Node type');
  }

  return mem;
};

/**
 * Parse a Design Token Object to provide the map of Token with helpers to generate the different output
 * @param specification Design Token content as specified on https://design-tokens.github.io/community-group/format/
 */
export const parseDesignToken = (specification: DesignTokenSpecification): DesignTokenVariableSet => {
  const initialMap: DesignTokenVariableSet = new Map();
  if (Object.keys(specification.document).every((key) => key.startsWith('$'))) {
    return initialMap;
  }
  return walkThroughDesignTokenNodes(specification.document, specification.context, [], initialMap);
};

interface ParseDesignTokenFileOptions {
  /**
   * Custom function to read a file required by the token renderer
   * @default {@see import('node:fs/promises').readFile}
   * @param filePath Path to the file to read
   */
  readFile?: (filePath: string) => string | Promise<string>;

  /** Custom context to provide to the parser and override the information determined by the specification parse process */
  specificationContext?: DesignTokenContext;
}

/**
 * Parse a Design Token File to provide the map of Token with helpers to generate the different output
 * @param specificationFilePath Path to the a Design Token file following the specification on https://design-tokens.github.io/community-group/format/
 * @param options
 */
export const parseDesignTokenFile = async (specificationFilePath: string, options?: ParseDesignTokenFileOptions) => {
  const readFile = options?.readFile || (async (filePath: string) => (await import('node:fs/promises')).readFile(filePath, { encoding: 'utf8' }));
  const context: DesignTokenContext = {
    basePath: dirname(specificationFilePath),
    ...options?.specificationContext
  };
  return parseDesignToken({ document: JSON.parse(await readFile(specificationFilePath)), context });
};
