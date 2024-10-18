import type {
  CssVariable
} from '@o3r/styling';
import type {
  DesignTokenVariableStructure,
  TokenKeyRenderer,
  TokenValueRenderer
} from '../../parsers/design-token-parser.interface';
import {
  getCssTokenValueRenderer
} from '../css';
import {
  isO3rPrivateVariable
} from '../design-token.renderer.helpers';

/** Options for {@link getMetadataTokenValueRenderer} */
export interface MetadataTokenValueRendererOptions {
  /**
   * Custom CSS Design Token value renderer
   */
  cssValueRenderer?: TokenValueRenderer;

  /**
   * Renderer the name of the CSS Variable (without initial --)
   */
  tokenVariableNameRenderer?: TokenKeyRenderer;

  /** Determine if the private variable should be ignored */
  ignorePrivateVariable?: boolean;
}

/**
 * Resolve the references and flatten them to keep only public references
 * @param refs List of references to resolves
 * @param variableSet Complete list of the parsed Design Token
 */
const resolvePrivateReferences = (refs: DesignTokenVariableStructure[], variableSet: Map<string, DesignTokenVariableStructure>): DesignTokenVariableStructure[] => {
  return [
    ...refs.filter((node) => !isO3rPrivateVariable(node)),
    ...refs
      .filter(isO3rPrivateVariable)
      .flatMap((node) => resolvePrivateReferences(node.getReferencesNode(variableSet), variableSet))
  ];
};

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getMetadataTokenValueRenderer = (options?: MetadataTokenValueRendererOptions): TokenValueRenderer => {
  const tokenVariableNameRenderer = options?.tokenVariableNameRenderer;
  const cssValueRenderer = options?.cssValueRenderer || getCssTokenValueRenderer({ tokenVariableNameRenderer });

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const cssType = variable.getType(variableSet);
    const references = variable.getReferencesNode(variableSet);
    const variableValue: CssVariable = {
      name: variable.getKey(tokenVariableNameRenderer),
      defaultValue: cssValueRenderer(variable, variableSet),
      description: variable.description,
      references: (options?.ignorePrivateVariable ? resolvePrivateReferences(references, variableSet) : references)
        .map((node) => JSON.parse(renderer(node, variableSet))),
      type: cssType === 'color' ? 'color' : 'string',
      ...variable.extensions.o3rMetadata
    };

    if (variableValue.references?.length === 0) {
      delete variableValue.references;
    }

    return JSON.stringify(variableValue);
  };
  return renderer;
};
