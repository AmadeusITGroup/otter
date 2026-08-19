import type {
  Async2Preprocessor,
  Async3Preprocessor,
  Oas2Preprocessor,
  Oas3Preprocessor,
} from '@redocly/openapi-core';

type Preprocessor = Oas2Preprocessor & Oas3Preprocessor & Async2Preprocessor & Async3Preprocessor;

/** Name of the enforce-discriminator-mandatory custom decorator */
export const DECORATOR_ID_ENFORCE_DISCRIMINATOR_MANDATORY = 'enforce-discriminator-mandatory';

/** Flag to indicate if the discriminator property was added to the required array */
const X_FLAG_ADDED_DISCRIMINATOR = 'x-added-required-discriminator';

/** Options for the enforce-discriminator-mandatory custom decorator */
export interface EnforceDiscriminatorMandatoryDecoratorOptions {
  /**
   * Optional flag to indicate if the discriminator property was added to the required array
   * @default false
   */
  flagAddedDiscriminator?: boolean;
}

/**
 * Custom decorator to enforce that discriminator fields are required in OpenAPI schemas.
 * This decorator works with OAS 2.0, 3.0, and 3.1 specifications.
 * @param options
 * @example Basic usage in redocly.yaml
 * ```yaml
 * plugins:
 *   - '@ama-openapi/redocly-plugin'
 *
 * apis:
 *   mySpec:
 *     root: apis/mySpec.json
 *     decorators:
 *       ama-openapi/enforce-discriminator-mandatory: on
 * ```
 */
export const enforceDiscriminatorMandatoryDecorator: Preprocessor = (options: EnforceDiscriminatorMandatoryDecoratorOptions) => {
  return {
    Schema: {
      // use `any` type because schema OAS 2.0 is not exposed in the core, and we want to support both OAS 2.0 and 3.0 schemas
      leave: (node: any) => {
        // Check if schema has a discriminator
        if (!node.discriminator) {
          return;
        }

        // Get the discriminator property name
        // In OAS 2.0, discriminator is a string
        // In OAS 3.0+, discriminator is an object with a propertyName field
        const discriminatorProperty = typeof node.discriminator === 'string'
          ? node.discriminator
          : node.discriminator.propertyName;

        if (!discriminatorProperty) {
          return;
        }

        // Ensure the required array exists
        node.required ||= [];

        // Add discriminator property to required if not already present
        if (!node.required.includes(discriminatorProperty)) {
          node.required.push(discriminatorProperty);
          if (options?.flagAddedDiscriminator) {
            node[X_FLAG_ADDED_DISCRIMINATOR] = true;
          }
        }
      }
    }
  };
};
