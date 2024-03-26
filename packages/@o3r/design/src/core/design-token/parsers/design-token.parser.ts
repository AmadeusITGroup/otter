import { promises as fs } from 'node:fs';
import type { DesignTokenVariableSet, DesignTokenVariableStructure, ParentReference } from './design-token-parser.interface';
import type {
  DesignToken,
  DesignTokenContext,
  DesignTokenExtensions,
  DesignTokenGroup,
  DesignTokenGroupExtensions,
  DesignTokenNode,
  DesignTokenSpecification
} from '../design-token-specification.interface';
import {
  DesignTokenTypeStrokeStyleValue,
  isDesignToken,
  isDesignTokenGroup,
  isTokenTypeStrokeStyleValueComplex
} from '../design-token-specification.interface';
import { dirname } from 'node:path';

const tokenReferenceRegExp = /\{([^}]+)\}/g;

const getTokenReferenceName = (tokenName: string, parents: string[]) => (`${parents.join('.')}.${tokenName}`);
const getExtensions = (parentNode: DesignTokenNode[]) => {
  return parentNode.reduce((acc, node) => {
    const o3rMetadata = { ...acc.o3rMetadata, ...node.$extensions?.o3rMetadata };
    return ({ ...acc, ...node.$extensions, o3rMetadata });
  }, {} as DesignTokenGroupExtensions & DesignTokenExtensions);
};
const getReferences = (cssRawValue: string) => Array.from(cssRawValue.matchAll(tokenReferenceRegExp)).map(([,tokenRef]) => tokenRef);
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const renderCssTypeStrokeStyleValue = (value: DesignTokenTypeStrokeStyleValue | string) => isTokenTypeStrokeStyleValueComplex(value) ? `${value.lineCap} ${value.dashArray.join(' ')}` : value;

const getCssRawValue = (variableSet: DesignTokenVariableSet, {node, getType}: DesignTokenVariableStructure) => {
  const nodeType = getType(variableSet, false);
  if (!nodeType && node.$value) {
    return typeof node.$value.toString !== undefined ? (node.$value as any).toString() : JSON.stringify(node.$value);
  }
  const checkNode = {
    ...node,
    $type: node.$type || nodeType
  } as typeof node;

  // TODO in the following code, `typeof checkNode.$value === 'string' ? checkNode.$value :` is defined to please Jest TS compilation. It should be removed when supported
  switch (checkNode.$type) {
    case 'color':
    case 'number':
    case 'duration':
    case 'fontWeight':
    case 'fontFamily':
    case 'dimension': {
      return checkNode.$value.toString();
    }
    case 'strokeStyle': {
      return renderCssTypeStrokeStyleValue(checkNode.$value);
    }
    case 'cubicBezier': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        checkNode.$value.join(', ');
    }
    case 'border': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        `${checkNode.$value.width} ${renderCssTypeStrokeStyleValue(checkNode.$value.style)} ${checkNode.$value.color}`;
    }
    case 'gradient': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        // TODO: add support of different gradient type when design-tokens/community-group#101 is fixed.
        `linear-gradient(0deg, ${checkNode.$value.map(({color, position}) => `${color} ${position}`).join(', ')})`;
    }
    case 'shadow': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        `${checkNode.$value.offsetX} ${checkNode.$value.offsetY} ${checkNode.$value.blur}  ${checkNode.$value.spread} ${checkNode.$value.color}`;
    }
    case 'transition': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        typeof checkNode.$value.timingFunction === 'string' ? checkNode.$value.timingFunction : checkNode.$value.timingFunction.join(' ') +
          ` ${checkNode.$value.duration} ${checkNode.$value.delay}`;
    }
    case 'typography': {
      return typeof checkNode.$value === 'string' ? checkNode.$value :
        `${checkNode.$value.fontWeight} ${checkNode.$value.fontFamily} ${checkNode.$value.fontSize} ${checkNode.$value.letterSpacing} ${checkNode.$value.lineHeight}`;
    }
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
      extensions: getExtensions([...ancestors.map(({ tokenNode }) => tokenNode), node]),
      node,
      tokenReferenceName,
      ancestors,
      parent: ancestors.slice(-1)[0],
      description: node.$description,
      getCssRawValue: function (variableSet = mem) {
        return getCssRawValue(variableSet, this);
      },
      getReferences: function (variableSet = mem) {
        return getReferences(this.getCssRawValue(variableSet));
      },
      getIsAlias: function (variableSet = mem) {
        return this.getReferences(variableSet).length === 1 && typeof node.$value === 'string' && !!node.$value?.toString().match(/^\{[^}]*\}$/);
      },
      getReferencesNode: function (variableSet = mem) {
        return this.getReferences(variableSet)
          .filter((ref) => variableSet.has(ref))
          .map((ref) => variableSet.get(ref)!);
      },
      getType: function (variableSet = mem, followReference = true) {
        return node.$type ||
          followReference && this.getIsAlias(variableSet) && this.getReferencesNode(variableSet)[0]?.getType(variableSet, followReference) ||
          followReference && this.parent?.name && variableSet.get(this.parent.name)?.getType(variableSet, followReference) ||
          undefined;
      },
      getKey: function (keyRenderer) {
        return keyRenderer ? keyRenderer(this) : this.tokenReferenceName.replace(/[ .]+/g, '-');
      }
    };

    mem.set(tokenReferenceName, tokenVariable);
  }
  else if (!isDesignTokenGroup(node)) {
    throw new Error('Fail to determine the Design Token Node type');
  }

  return mem;
};

/**
 * Parse a Design Token Object to provide the map of Token with helpers to generate the different output
 * @param specification Design Token content as specified on https://design-tokens.github.io/community-group/format/
 */
export const parseDesignToken = (specification: DesignTokenSpecification): DesignTokenVariableSet => {
  return walkThroughDesignTokenNodes(specification.document, specification.context, [], new Map());
};

interface ParseDesignTokenFileOptions {
  /**
   * Custom function to read a file required by the token renderer
   * @default {@see fs.promises.readFile}
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
  const readFile = options?.readFile || ((filePath: string) => fs.readFile(filePath, { encoding: 'utf-8' }));
  const context: DesignTokenContext = {
    basePath: dirname(specificationFilePath)
  };
  return parseDesignToken({ document: JSON.parse(await readFile(specificationFilePath)), context });
};
