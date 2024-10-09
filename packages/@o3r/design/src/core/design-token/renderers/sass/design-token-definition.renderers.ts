import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import type { Logger } from '@o3r/core';
import { isO3rPrivateVariable } from '../design-token.renderer.helpers';
import { getSassTokenValueRenderer } from './design-token-value.renderers';

export interface SassTokenDefinitionRendererOptions {

  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the Sass Variable (without initial $)
   * @default {@see tokenVariableNameSassRenderer}
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Determine if the variable is private and should not be rendered
   * @default {@see isO3rPrivateVariable}
   */
  isPrivateVariable?: (variable: DesignTokenVariableStructure) => boolean;

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
  const tokenValueRenderer = options?.tokenValueRenderer || getSassTokenValueRenderer({ logger: options?.logger });
  const keyRenderer = options?.tokenVariableNameRenderer || tokenVariableNameSassRenderer;
  const isPrivateVariable = options?.isPrivateVariable || isO3rPrivateVariable;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    let variableString = `$${variable.getKey(keyRenderer)}: ${ tokenValueRenderer(variable, variableSet) }${ variable.extensions.o3rExpectOverride ? ' !default' : '' };`;
    if (isPrivateVariable(variable)) {
      variableString = '/// @access private\n' + variableString;
    }
    if (variable.description){
      variableString = variable.description.split(/[\n\r]+/).map((line) => `/// ${line}`).join('\n') + '\n' + variableString;
    }

    return variableString;
  };
  return renderer;
};
