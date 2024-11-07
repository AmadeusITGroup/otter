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

/** Options for {@link getSassTokenValueRenderer} */
export interface SassTokenValueRendererOptions {
  /**
   * Renderer for the name of the CSS variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /**
   * Renderer for the reference to Design Token
   */
  referenceRenderer?: TokenReferenceRenderer;

  /**
   * Renderer for the reference to unregistered Design Token
   * Note: the default renderer displays a warning message when called
   */
  unregisteredReferenceRenderer?: UnregisteredTokenReferenceRenderer;

  /**
   * Custom logger
   * Nothing will be logged if not provided
   */
  logger?: Logger;
}

/**
 * Retrieve the Design Token reference renderer
 * @param options
 */
export const getSassTokenReferenceRenderer = (options?: SassTokenValueRendererOptions): TokenReferenceRenderer => {
  return (variable: DesignTokenVariableStructure, _variableSet, defaultValue): string => {
    const sassVarName = variable.getKey(options?.tokenVariableNameRenderer);
    return defaultValue ? `if(variable-exists(${sassVarName}), $${sassVarName}, ${defaultValue})` : `$${sassVarName}`;
  };
};

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getSassTokenValueRenderer = (options?: SassTokenValueRendererOptions): TokenValueRenderer => {
  const defaultUnregisteredReferenceRenderer = (variableName: string, _variableSet: Map<string, DesignTokenVariableStructure>): string => {
    const sassVarName = variableName.replace(/[ .]+/g, '-');
    options?.logger?.warn?.(`Variable "${variableName}" is not registered, $${sassVarName} will be rendered with a check`);
    return `if(variable-exists(${sassVarName}), $${sassVarName}, null)`;
  };

  const referenceRenderer = options?.referenceRenderer || getSassTokenReferenceRenderer(options);
  const unregisteredReferenceRenderer = options?.unregisteredReferenceRenderer || defaultUnregisteredReferenceRenderer;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>, enforceReferenceRendering = false) => {
    let variableValue = '';
    if (enforceReferenceRendering) {
      variableValue = referenceRenderer(variable, variableSet);
    } else if (variable.getIsAlias(variableSet)) {
      const ref = variable.getReferencesNode(variableSet)[0];
      variableValue = ref
        ? referenceRenderer(ref, variableSet)
        : defaultUnregisteredReferenceRenderer(variable.getReferences(variableSet)[0], variableSet);
    } else {
      variableValue = variable.getCssRawValue(variableSet).replaceAll(/{([^}]*)}/g, (_defaultValue, matcher: string) =>
        `#{${(variableSet.has(matcher) ? referenceRenderer(variableSet.get(matcher)!, variableSet) : unregisteredReferenceRenderer(matcher, variableSet))}}`
      );
    }
    variableValue += variableValue && variable.extensions.o3rImportant ? ' !important' : '';
    return variableValue;
  };
  return renderer;
};
