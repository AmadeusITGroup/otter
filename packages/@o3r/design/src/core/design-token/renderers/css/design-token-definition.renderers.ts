import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { shouldDefineVariableValueFromOtterInfo } from '../design-token.renderer.helpers';
import { TokenDefinitionRenderer } from '../design-token.renderer.interface';
import { getCssTokenValueRenderer } from './design-token-value.renderers';

interface CssTokenDefinitionRendererOptions {
  /**
   * Determine if the variable should be rendered, based on Otter Extension information
   * @default {@see shouldDefineCssVariableFromOtterInfo}
   */
  shouldDefineCssVariable?: (variable: DesignTokenVariableStructure) => boolean;

  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;

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
  const isCssVariableToDefined = options?.shouldDefineCssVariable || shouldDefineVariableValueFromOtterInfo;
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer();
  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    let variableString: string | undefined;
    if (isCssVariableToDefined(variable)) {
      variableString = `${variable.getKey()}: ${tokenValueRenderer(variable, variableSet)};`;
      if (variable.extensions.o3rScope) {
        variableString = `${variable.extensions.o3rScope} { ${variableString} }`;
      }
    } else if (options?.privateDefinitionRenderer) {
      variableString = options.privateDefinitionRenderer(variable, variableSet);
    }
    if (variableString && variable.description) {
      variableString = `/* ${variable.description} */\n${variableString}`;
    }
    return variableString;
  };
  return renderer;
};
