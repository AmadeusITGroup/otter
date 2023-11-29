import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getMetadataTokenValueRenderer } from './design-token-value.renderers';
import type { CssVariable } from '@o3r/styling';

interface MetadataTokenDefinitionRendererOptions {
  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;
}

/**
 * Retrieve the Design Token Variable renderer for Metadata
 * @param options
 * @returns
 */
export const getMetadataTokenDefinitionRenderer = (options?: MetadataTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getMetadataTokenValueRenderer();

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const variableValue = tokenValueRenderer(variable, variableSet);
    return `"${(JSON.parse(variableValue) as CssVariable).name}": ${variableValue}`;
  };
  return renderer;
};
