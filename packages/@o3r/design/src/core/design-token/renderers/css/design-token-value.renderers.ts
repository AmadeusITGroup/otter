import type {
  Logger
} from '@o3r/core';
import type {
  DesignTokenVariableStructure,
  TokenKeyRenderer,
  TokenReferenceRenderer,
  TokenValueRenderer,
  UnregisteredTokenReferenceRenderer
} from '../../parsers/design-token-parser.interface';
import {
  isO3rPrivateVariable
} from '../design-token.renderer.helpers';

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
  referenceRenderer?: TokenReferenceRenderer;

  /**
   * Render for the reference to unregistered Design Token
   * Note: the default renderer display a warning message when called
   */
  unregisteredReferenceRenderer?: UnregisteredTokenReferenceRenderer;

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

  const defaultReferenceRenderer: TokenReferenceRenderer = (variable, variableSet, defaultValue): string => {
    return isPrivateVariable(variable)
      ? `var(--${variable.getKey(tokenVariableNameRenderer)}, ${renderer(variable, variableSet)})`
      : `var(--${variable.getKey(tokenVariableNameRenderer)}${defaultValue ? ', ' + defaultValue : ''})`;
  };

  const defaultUnregisteredReferenceRenderer = (variableName: string, _variableSet: Map<string, DesignTokenVariableStructure>): string => {
    const cssVarName = `var(--${variableName.replace(/[ .]+/g, '-')})`;
    options?.logger?.debug?.(`Variable "${variableName}" is not registered, it will be rendered as "${cssVarName}"`);
    return cssVarName;
  };

  const referenceRenderer = options?.referenceRenderer || defaultReferenceRenderer;
  const unregisteredReferenceRenderer = options?.unregisteredReferenceRenderer || defaultUnregisteredReferenceRenderer;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>, enforceReferenceRendering = false) => {
    let variableValue = variable.getCssRawValue(variableSet).replaceAll(/{([^}]*)}/g, (_defaultValue, matcher: string) =>
      (variableSet.has(matcher) ? referenceRenderer(variableSet.get(matcher)!, variableSet) : unregisteredReferenceRenderer(matcher, variableSet))
    );
    if (enforceReferenceRendering) {
      variableValue = referenceRenderer(variable, variableSet, variableValue);
    }
    variableValue += variableValue && variable.extensions.o3rImportant ? ' !important' : '';
    return variableValue;
  };
  return renderer;
};
