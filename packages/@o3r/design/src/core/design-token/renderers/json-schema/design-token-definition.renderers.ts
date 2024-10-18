import type {
  DesignTokenVariableStructure,
  TokenValueRenderer
} from '../../parsers/design-token-parser.interface';
import type {
  TokenDefinitionRenderer
} from '../design-token.renderer.interface';
import {
  getJsonSchemaTokenValueRenderer
} from './design-token-value.renderers';

/** Options for {@link getJsonSchemaTokenDefinitionRenderer} */
export interface JsonSchemaTokenDefinitionRendererOptions {
  /** Custom Design Token value renderer */
  tokenValueRenderer?: TokenValueRenderer;
}

/**
 * Retrieve the Design Token Variable renderer for Json Schema
 * @param options
 */
export const getJsonSchemaTokenDefinitionRenderer = (options?: JsonSchemaTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getJsonSchemaTokenValueRenderer();

  const generateNode = (currentVariable: DesignTokenVariableStructure, variableValue: string, ancestors: typeof currentVariable.ancestors): { type: string; properties: Record<any, any> }[] => {
    return [
      {
        type: 'object',
        properties: {
          [ancestors.map(({ name }) => name).join('.') + (ancestors.length > 0 ? '.' : '') + currentVariable.tokenReferenceName.split('.').at(-1)]: JSON.parse(variableValue)
        }
      },
      ...ancestors.length > 0
        ? [{
          type: 'object',
          properties: {
            [ancestors[0].name]: {
              anyOf: generateNode(currentVariable, variableValue, ancestors.slice(1))
            }
          }
        }]
        : []
    ];
  };

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const variableValue = tokenValueRenderer(variable, variableSet);

    const res = {
      anyOf: generateNode(variable, variableValue, variable.ancestors)
    };
    return JSON.stringify(res);
  };
  return renderer;
};
