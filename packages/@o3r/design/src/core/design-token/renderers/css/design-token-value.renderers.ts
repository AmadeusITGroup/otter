import type { DesignTokenVariableStructure, TokenKeyRenderer, TokenReferenceRender, TokenValueRenderer, UnregisteredTokenReferenceRender } from '../../parsers/design-token-parser.interface';
import { isO3rPrivateVariable } from '../design-token.renderer.helpers';
import type { Logger } from '@o3r/core';

/** Options for {@link getCssTokenValueRenderer} */
export interface CssTokenValueRendererOptions {
  /**
   * Determine if the variable is private and should not be rendered
   * @default {@see isO3rPrivateVariable}
   */
  isPrivateVariable?: (variable: DesignTokenVariableStructure) => boolean;

  /**
   * Renderer the name of the CSS Variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Render for the reference to Design Token
   */
  referenceRenderer?: TokenReferenceRender;

  /**
   * Render for the reference to unregistered Design Token
   * Note: the default renderer display a warning message when called
   */
  unregisteredReferenceRenderer?: UnregisteredTokenReferenceRender;

  /**
   * Custom logger
   * Nothing will be logged if not provided
   */
  logger?: Logger;
}

/**
 * Retrieve the Design Token value renderer
 * @param options
 * @example Throw on unregistered Design Token reference
 * ```typescript
 * getCssTokenValueRenderer({ unregisteredReferenceRenderer: (varName) => { throw new Error(`var ${varName} not registered`) } })
 * ```
 */
export const getCssTokenValueRenderer = (options?: CssTokenValueRendererOptions): TokenValueRenderer => {
  const isPrivateVariable = options?.isPrivateVariable || isO3rPrivateVariable;
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;

  const defaultReferenceRenderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>): string => {
    if (isPrivateVariable(variable)) {
      // eslint-disable-next-line no-use-before-define
      return `var(--${variable.getKey(tokenVariableNameRenderer)}, ${renderer(variable, variableSet)})`;
    } else {
      return `var(--${variable.getKey(tokenVariableNameRenderer)})`;
    }
  };

  const defaultUnregisteredReferenceRenderer = (variableName: string, _variableSet: Map<string, DesignTokenVariableStructure>): string => {
    const cssVarName = `var(--${variableName.replace(/[. ]+/g, '-')})`;
    options?.logger?.debug?.(`Variable "${variableName}" not registered, will be renderer as "${cssVarName}"`);
    return cssVarName;
  };

  const referenceRenderer = options?.referenceRenderer || defaultReferenceRenderer;
  const unregisteredReferenceRenderer = options?.unregisteredReferenceRenderer || defaultUnregisteredReferenceRenderer;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>, enforceReferenceRendering = false) => {
    let variableValue = enforceReferenceRendering
      ? referenceRenderer(variable, variableSet)
      : variable.getCssRawValue(variableSet).replaceAll(/\{([^}]*)\}/g, (_defaultValue, matcher: string) =>
        (variableSet.has(matcher) ? referenceRenderer(variableSet.get(matcher)!, variableSet) : unregisteredReferenceRenderer(matcher, variableSet))
      );
    variableValue += variableValue && variable.extensions.o3rImportant ? ' !important' : '';
    return variableValue;
  };
  return renderer;
};
