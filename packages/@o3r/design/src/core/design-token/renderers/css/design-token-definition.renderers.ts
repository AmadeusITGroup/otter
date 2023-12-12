import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { isNotPrivateVariable } from '../design-token.renderer.helpers';
import { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getCssTokenValueRenderer } from './design-token-value.renderers';

interface CssTokenDefinitionRendererOptions {
  /**
   * Determine if the variable should be rendered, based on Otter Extension information
   * @default {@see isNotPrivateVariable}
   */
  shouldDefineCssVariable?: (variable: DesignTokenVariableStructure) => boolean;

  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the CSS Variable (with the initial --)
   **/
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Private Design Token definition renderer
   * The private variable will not be rendered if not provided
   */
  privateDefinitionRenderer?: TokenDefinitionRenderer;
}

/**
 * Retrieve the Design Token Variable renderer for CSS
 * @param options
 * @returns
 */
export const getCssTokenDefinitionRenderer = (options?: CssTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const shouldDefineVariable = options?.shouldDefineCssVariable || isNotPrivateVariable;
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer({ shouldDefineVariable, tokenVariableNameRenderer });

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    let variableString: string | undefined;
    if (shouldDefineVariable(variable)) {
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
