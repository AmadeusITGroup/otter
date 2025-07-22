import type {
  CssVariable,
} from '@o3r/styling';
import type {
  DesignTokenVariableStructure,
  TokenKeyRenderer,
  TokenValueRenderer,
} from '../../parsers/design-token-parser.interface';
import {
  isO3rPrivateVariable,
} from '../design-token.renderer.helpers';
import type {
  TokenDefinitionRenderer,
} from '../design-token.renderer.interface';
import {
  getMetadataTokenValueRenderer,
} from './design-token-value.renderers';

/** Options for {@link getMetadataTokenDefinitionRenderer} */
export interface MetadataTokenDefinitionRendererOptions {
  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the CSS Variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /** Determine if the private variable should be ignored */
  ignorePrivateVariable?: boolean;
}

/**
 * Retrieve the Design Token Variable renderer for Metadata
 * @param options
 * @example Customize metadata renderer
 * ```typescript
 * const getCustomMetadataTokenValueRenderer = (options?: MetadataTokenValueRendererOptions): TokenValueRenderer => {
 *   const defaultMetadataRender = getMetadataTokenValueRenderer(options);
 *   return  (variable, variableSet) => {
 *     const defaultMetadataObj = JSON.parse(defaultMetadataRender(variable, variableSet));
 *     // Add custom field
 *     defaultMetadataObj.myField = 'custom value';
 *     return JSON.stringify(defaultMetadataObj);
 *   };
 * };
 *
 * // List of Design Token item parsed
 * // List of parsed Design Token items
 *
 * const tokenValueRenderer = getCustomMetadataTokenValueRenderer();
 *
 * const metadataTokenDefinitionRenderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer });
 *
 * // Render the Metadata file
 * await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: lessTokenDefinitionRenderer });
 * ```
 */
export const getMetadataTokenDefinitionRenderer = (options?: MetadataTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;
  const ignorePrivateVariable = options?.ignorePrivateVariable;
  const tokenValueRenderer = options?.tokenValueRenderer || getMetadataTokenValueRenderer({ tokenVariableNameRenderer, ignorePrivateVariable });

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    if (ignorePrivateVariable && isO3rPrivateVariable(variable)) {
      return undefined;
    }
    const variableValue = tokenValueRenderer(variable, variableSet);
    return `"${(JSON.parse(variableValue) as CssVariable).name}": ${variableValue}`;
  };
  return renderer;
};
