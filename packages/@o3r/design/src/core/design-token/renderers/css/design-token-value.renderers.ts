import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';
import { shouldDefineVariableValueFromOtterInfo } from '../design-token.renderer.helpers';

interface CssTokenValueRendererOptions {
  /**
   * Determine if the variable should be rendered, based on Otter Extension information
   * @default {@see shouldDefineVariableValueFromOtterInfo}
   */
  shouldDefineVariableValue?: (variable: DesignTokenVariableStructure) => boolean;
}

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getCssTokenValueRenderer = (options?: CssTokenValueRendererOptions): TokenValueRenderer => {
  const isVariableToDefined = options?.shouldDefineVariableValue || shouldDefineVariableValueFromOtterInfo;
  const referenceRenderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>): string => {
    if (isVariableToDefined(variable)) {
      return `var(${variable.cssVarName})`;
    } else {
      // eslint-disable-next-line no-use-before-define
      return `var(${variable.cssVarName}, ${renderer(variable, variableSet)})`;
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
