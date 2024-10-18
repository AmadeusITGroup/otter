import type { DesignTokenVariableStructure, TokenValueRenderer } from '../../parsers/design-token-parser.interface';

/** Options for {@link getJsonSchemaTokenValueRenderer} */
export interface JsonSchemaTokenValueRendererOptions {
  /**
   * Generate reference URL to the JSON Schema definition
   * @default {@link getJsonSchemaTokenReferenceUrl}
   */
  referenceUrlRenderer?: (tokenType?: string) => string;
}

/**
 * Default renderer for the reference URL to the JSON Schema defining the Token Type
 * @param tokenType Type of the Token to refer to
 */
export const getJsonSchemaTokenReferenceUrl = (tokenType = 'implicit'): string => {
  const capitalTokenType = tokenType.charAt(0).toUpperCase() + tokenType.slice(1);
  return `https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/design/schemas/design-token.schema.json#/definitions/tokenType${capitalTokenType}`;
};

/**
 * Retrieve the Design Token value renderer
 * @param options
 */
export const getJsonSchemaTokenValueRenderer = (options?: JsonSchemaTokenValueRendererOptions): TokenValueRenderer => {
  const referenceUrl = options?.referenceUrlRenderer || getJsonSchemaTokenReferenceUrl;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    const cssType = variable.getType(variableSet);
    const variableValue: any = {
      description: variable.description,
      default: variable.getCssRawValue(variableSet)
    };
    if (cssType) {
      variableValue.oneOf = [
        { $ref: referenceUrl() },
        { $ref: referenceUrl(cssType) }
      ];
    } else {
      variableValue.$ref = referenceUrl();
    }

    return JSON.stringify(variableValue);
  };
  return renderer;
};
