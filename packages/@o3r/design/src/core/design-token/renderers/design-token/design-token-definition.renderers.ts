import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getDesignTokenTokenValueRenderer } from './design-token-value.renderers';

/** Options for {@link getDesignTokenTokenDefinitionRenderer} */
export interface DesignTokenTokenDefinitionRendererOptions {
  /**
   * Custom Design Token value renderer
   */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Number of key to join together
   * @default 0
   */
  keyJoinNumber?: undefined | number;
}

/**
 * Retrieve the Design Token Variable renderer for DesignToken
 * @param options
 */
export const getDesignTokenTokenDefinitionRenderer = (options?: DesignTokenTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getDesignTokenTokenValueRenderer();

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const variableValue = tokenValueRenderer(variable, variableSet);

    const splitNodeIndex = (options?.keyJoinNumber || 0) + 1;
    const nodeNames = variable.tokenReferenceName.split('.');
    const rootName = nodeNames.slice(0, splitNodeIndex).join('.');
    const node = nodeNames.slice(splitNodeIndex)
      .reverse()
      .reduce((acc: Record<string, any> | string, cur) => {
        return { [cur]: acc };
      }, variableValue);
    return JSON.stringify({ [rootName]: node });
  };
  return renderer;
};
