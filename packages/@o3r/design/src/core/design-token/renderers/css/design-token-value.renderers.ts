import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { shouldDefineVariableValueFromOtterInfo } from '../design-token.renderer.helpers';

interface CssTokenValueRendererOptions {
  /**
   * Determine if the variable should be rendered, based on Otter Extension information
   * @default {@see shouldDefineVariableValueFromOtterInfo}
   */
  shouldDefineVariable?: (variable: DesignTokenVariableStructure) => boolean;

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
  const isVariableToDefined = options?.shouldDefineVariable || shouldDefineVariableValueFromOtterInfo;
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;

  const referenceRenderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>): string => {
    if (isVariableToDefined(variable)) {
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
