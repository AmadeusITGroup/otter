import type {
  DesignToken
} from '../../design-token-specification.interface';
import type {
  DesignTokenVariableStructure,
  TokenValueRenderer
} from '../../parsers/design-token-parser.interface';

/** Options for {@link getDesignTokenTokenValueRenderer} */
export interface DesignTokenTokenValueRendererOptions {
}

/**
 * Retrieve the Design Token value renderer
 * @param _options
 */
export const getDesignTokenTokenValueRenderer = (_options?: DesignTokenTokenValueRendererOptions): TokenValueRenderer => {
  const renderer = (variable: DesignTokenVariableStructure, _variableSet: Map<string, DesignTokenVariableStructure>) => {
    const variableValue: DesignToken = {
      ...variable.node,
      $description: variable.description,
      $extensions: variable.extensions
    };

    return JSON.stringify(variableValue);
  };
  return renderer;
};
