import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  type FrameNode,
  type GetFile200Response,
  type GetLocalVariables200ResponseMeta,
} from '@ama-styling/figma-sdk';
import {
  getRgbaColorHex,
} from '../../helpers/color-hex-helpers';
import {
  generateTokenTree,
} from '../../helpers/generate-token-tree-helpers';
import {
  getVariablesFormatter,
} from '../../helpers/variable-formatter';
import type {
  FigmaFileContext,
} from '../../interfaces';

interface Effect {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
}

/** Options to {@link generateEffectStyles} */
export interface EffectStylesOptions extends FigmaFileContext {
  /** Default unit to apply to number when not excluded */
  defaultUnit?: string;
}

/**
 * Generate effect style tokens
 * @param apiClient Api Client
 * @param figmaFile Figma File information
 * @param localVariablesResponse list of file variables
 * @param options Options
 */
export const generateEffectStyles = async (
  apiClient: ApiClient,
  figmaFile: Promise<GetFile200Response>,
  localVariablesResponse: Promise<GetLocalVariables200ResponseMeta>,
  options: EffectStylesOptions
) => {
  const formatVariables = getVariablesFormatter(await localVariablesResponse);
  const filesApi = new FilesApi(apiClient);
  const styles = (await figmaFile).styles;
  const ids = Object.entries(styles)
    .filter(([, { styleType, remote }]) => styleType === 'EFFECT' && !remote)
    .map(([id]) => id)
    .join(',');
  const nodes = (await filesApi.getFileNodes({ file_key: options.fileKey, ids })).nodes;
  const ret = Object.values(nodes)
    .filter(({ document }) => (document as FrameNode).effects.length > 0)
    .reduce((acc, { document }) => {
      const doc = document as FrameNode;
      const value = doc.effects
        .map((effect): Effect | undefined => {
          switch (effect.type) {
            case 'INNER_SHADOW':
            case 'DROP_SHADOW': {
              return {
                blur: formatVariables(effect.boundVariables?.radius) || `${effect.radius}${options.defaultUnit || 'px'}` || '0',
                color: formatVariables(effect.boundVariables?.color) || getRgbaColorHex(effect.color) || '',
                offsetX: formatVariables(effect.boundVariables?.offsetX) || `${effect.offset.x}${options.defaultUnit || 'px'}` || '0',
                offsetY: formatVariables(effect.boundVariables?.offsetY) || `${effect.offset.y}${options.defaultUnit || 'px'}` || '0',
                spread: formatVariables(effect.boundVariables?.spread) || `${effect.spread}${options.defaultUnit || 'px'}` || '0',
                inset: effect.type === 'INNER_SHADOW'
              };
            }
            default: {
              options.logger?.warn?.(`Not supported effect type ${effect.type} for ${doc.id}`);
            }
          }
        })
        .filter((effect): effect is Effect => !!effect);
      acc[doc.name] = { value, description: styles[document.id].description };
      return acc;
    }, {} as Record<string, { value: Effect[]; description?: string }>);
  return generateTokenTree(ret, 'shadow');
};
