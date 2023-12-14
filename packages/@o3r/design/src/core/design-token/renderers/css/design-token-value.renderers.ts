import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { isO3rPrivateVariable } from '../design-token.renderer.helpers';

interface CssTokenValueRendererOptions {
  /**
   * Determine if the variable is private and should not be rendered
   * @default {@see isO3rPrivateVariable}
   */
  isPrivateVariable?: (variable: DesignTokenVariableStructure) => boolean;

  /**
   * Renderer the name of the CSS Variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;
}

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getCssTokenValueRenderer = (options?: CssTokenValueRendererOptions): TokenValueRenderer => {
  const isPrivateVariable = options?.isPrivateVariable || isO3rPrivateVariable;
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;

  const referenceRenderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>): string => {
    if (!isPrivateVariable(variable)) {
      return `var(--${variable.getKey(tokenVariableNameRenderer)})`;
    } else {
      // eslint-disable-next-line no-use-before-define
      return `var(--${variable.getKey(tokenVariableNameRenderer)}, ${renderer(variable, variableSet)})`;
    }
  };
  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    let variableValue = variable.getCssRawValue(variableSet).replaceAll(/\{([^}]*)\}/g, (defaultValue, matcher) =>
      (variableSet.has(matcher) ? referenceRenderer(variableSet.get(matcher)!, variableSet) : defaultValue)
    );
    variableValue += variableValue && variable.extensions.o3rImportant ? ' !important' : '';
    return variableValue;
  };
  return renderer;
};
