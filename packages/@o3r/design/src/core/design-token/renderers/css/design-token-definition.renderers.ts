import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { isO3rPrivateVariable } from '../design-token.renderer.helpers';
import { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getCssTokenValueRenderer } from './design-token-value.renderers';

interface CssTokenDefinitionRendererOptions {
  /**
   * Determine if the variable is private and should not be rendered
   * @default {@see isO3rPrivateVariable}
   */
  isPrivateVariable?: (variable: DesignTokenVariableStructure) => boolean;

  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the CSS Variable (with the initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Private Design Token definition renderer
   * The private variable will not be rendered if not provided
   */
  privateDefinitionRenderer?: TokenDefinitionRenderer;
}

/**
 * Retrieve the Design Token variable renderer for CSS
 * @param options
 * @returns
 * @example CSS renderer with Sass fallback
 * ```typescript
 * import { getSassTokenDefinitionRenderer } from '@o3r/design';
 *
 * // List of parsed Design Token items
 * const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');
 *
 * // Sass variable renderer
 * const sassTokenDefinitionRenderer = getSassTokenDefinitionRenderer();
 *
 * // CSS variable renderer
 * const cssTokenDefinitionRenderer = getCssTokenDefinitionRenderer({
 *   // Specify that the private variable should be rendered in Sass variable
 *   privateDefinitionRenderer: sassTokenDefinitionRenderer
 * });
 *
 * // Render the CSS variables
 * await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: cssTokenDefinitionRenderer });
 * ```
 */
export const getCssTokenDefinitionRenderer = (options?: CssTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const isPrivateVariable = options?.isPrivateVariable || isO3rPrivateVariable;
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer({ isPrivateVariable, tokenVariableNameRenderer });

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    let variableString: string | undefined;
    if (!isPrivateVariable(variable)) {
      variableString = `--${variable.getKey(tokenVariableNameRenderer)}: ${tokenValueRenderer(variable, variableSet)};`;
      if (variable.extensions.o3rScope) {
        variableString = `${variable.extensions.o3rScope} { ${variableString} }`;
      }
    } else if (options?.privateDefinitionRenderer && variable.extensions.o3rPrivate) {
      variableString = options.privateDefinitionRenderer(variable, variableSet);
    }
    if (variableString && variable.description) {
      variableString = `/* ${variable.description} */\n${variableString}`;
    }
    return variableString;
  };
  return renderer;
};
