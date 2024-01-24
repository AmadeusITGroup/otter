import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getCssTokenValueRenderer } from '../css/design-token-value.renderers';
import type { Logger } from '@o3r/core';

export interface SassTokenDefinitionRendererOptions {

  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the Sass Variable (without initial $)
   * @default {@see tokenVariableNameSassRenderer}
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Custom logger
   * Nothing will be logged if not provided
   */
  logger?: Logger;
}

/**
 * Default Sass variable name renderer
 * @param variable
 */
export const tokenVariableNameSassRenderer: TokenKeyRenderer = (variable) => {
  return variable.getKey();
};

/**
 * Retrieve the Design Token Variable renderer for Sass
 * @param options
 * @returns
 */
export const getSassTokenDefinitionRenderer = (options?: SassTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer({ logger: options?.logger });
  const keyRenderer = options?.tokenVariableNameRenderer || tokenVariableNameSassRenderer;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    return `$${variable.getKey(keyRenderer)}: ${ tokenValueRenderer(variable, variableSet, true) };`;
  };
  return renderer;
};
