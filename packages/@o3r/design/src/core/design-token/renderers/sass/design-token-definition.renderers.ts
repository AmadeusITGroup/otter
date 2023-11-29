import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getCssTokenValueRenderer } from '../css/design-token-value.renderers';

interface SassTokenDefinitionRendererOptions {
  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;
}

const fromCssVarNameToSassVar = (variableName: string) => {
  const tokens = variableName.replace(/^--/, '').split('-');
  return tokens[0] + tokens.slice(1).map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join('');
};

/**
 * Retrieve the Design Token Variable renderer for Sass
 * @param options
 * @returns
 */
export const getSassTokenDefinitionRenderer = (options?: SassTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer();

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    return `$${ fromCssVarNameToSassVar(variable.cssVarName) }: ${ tokenValueRenderer(variable, variableSet) };`;
  };
  return renderer;
};
