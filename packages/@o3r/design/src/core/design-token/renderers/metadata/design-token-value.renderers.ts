import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import type { CssVariable } from '@o3r/styling';
import { getCssTokenValueRenderer } from '../css';

interface MetadataTokenValueRendererOptions {
  /**
   * Custom CSS Design Token value renderer
   */
  cssValueRenderer: TokenValueRenderer;
}

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getMetadataTokenValueRenderer = (options?: MetadataTokenValueRendererOptions): TokenValueRenderer => {
  const cssValueRenderer = options?.cssValueRenderer || getCssTokenValueRenderer();
  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const cssType = variable.getType(variableSet);
    const variableValue: CssVariable = {
      name: variable.cssVarName.replace(/^--/, ''),
      defaultValue: cssValueRenderer(variable, variableSet),
      description: variable.description,
      references: variable.getReferencesNode(variableSet).map((node) => JSON.parse(renderer(node, variableSet))),
      type: cssType !== 'color' ? 'string' : 'color',
      ...variable.extensions.o3rMetadata
    };

    return JSON.stringify(variableValue);
  };
  return renderer;
};
