import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  type GetFile200Response,
  type GetLocalVariables200ResponseMeta,
  type GradientPaint,
  type RectangleNode,
} from '@ama-styling/figma-sdk';
import {
  getRgbaColorHex,
} from '../../helpers/color-hex.helpers';
import {
  getVariablesFormatter,
} from '../../helpers/variable-formatter';
import {
  vectorToAngle,
} from '../../helpers/vector';
import type {
  FigmaFileContext,
} from '../../interfaces';

interface GradientScope {
  color: string;
  position: number | string;
}

interface Gradient {
  type: string;
  angle: number;
  stops: GradientScope[];
}

const GRADIENT_TYPES = {
  GRADIENT_LINEAR: 'linear',
  GRADIENT_RADIAL: 'radical',
  GRADIENT_ANGULAR: 'angular',
  GRADIENT_DIAMOND: 'diamond'
} as const;

/** Options to {@link generateColorStyles} */
export interface ColorStylesOptions extends FigmaFileContext {
}

/**
 * Generate colors style tokens
 * @param apiClient Api Client
 * @param figmaFile Figma File information
 * @param localVariablesResponse list of file variables
 * @param options Options
 */
export const generateColorStyles = async (
  apiClient: ApiClient,
  figmaFile: Promise<GetFile200Response>,
  localVariablesResponse: GetLocalVariables200ResponseMeta,
  options: ColorStylesOptions
) => {
  const formatVariables = getVariablesFormatter(localVariablesResponse);
  const filesApi = new FilesApi(apiClient);
  const styles = (await figmaFile).styles;
  const ids = Object.entries(styles)
    .filter(([, { styleType, remote }]) => styleType === 'FILL' && !remote)
    .map(([id]) => id)
    .join(',');
  const nodes = (await filesApi.getFileNodes({ file_key: options.fileKey, ids })).nodes;
  const ret = Object.values(nodes)
    .filter(({ document }) => !!((document as RectangleNode).fills[0] as GradientPaint).gradientStops)
    .reduce((acc, { document }) => {
      const doc = document as RectangleNode;
      const gradient = doc.fills[0] as GradientPaint;
      const gradientType = GRADIENT_TYPES[gradient.type];
      const stops = gradient.gradientStops
        .map((stop) => ({
          position: stop.position,
          color: formatVariables(stop.boundVariables?.color) ?? getRgbaColorHex(stop.color)
        }));
      const value = {
        type: gradientType,
        angle: vectorToAngle(gradient.gradientHandlePositions),
        stops
      } satisfies Gradient;
      acc[doc.name] = { value, description: styles[document.id].description };
      return acc;
    }, {} as Record<string, { value: Gradient; description?: string }>);
  return Object.entries(ret)
    .reduce((acc, [name, { value, description }]) => {
      const splitName = name.split('/');
      let curr = acc;
      splitName.forEach((n) => curr = curr[n] ||= {});
      Object.assign(curr, {
        $type: 'gradient',
        $description: description || undefined,
        $value: value
      });
      return acc;
    }, {} as any);
};
