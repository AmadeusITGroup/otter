import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getMetadataTokenValueRenderer } from './design-token-value.renderers';
import type { CssVariable } from '@o3r/styling';

interface MetadataTokenDefinitionRendererOptions {
  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the CSS Variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;
}

/**
 * Retrieve the Design Token Variable renderer for Metadata
 * @param options
 * @returns
 */
export const getMetadataTokenDefinitionRenderer = (options?: MetadataTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;
  const tokenValueRenderer = options?.tokenValueRenderer || getMetadataTokenValueRenderer({ tokenVariableNameRenderer });

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const variableValue = tokenValueRenderer(variable, variableSet);
    return `"${(JSON.parse(variableValue) as CssVariable).name}": ${variableValue}`;
  };
  return renderer;
};
