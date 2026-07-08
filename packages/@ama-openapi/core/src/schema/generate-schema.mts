import type {
  Context,
} from '../context.mjs';
import {
  getManifestModelsProperties,
} from './configurations/manifest-model-properties.mjs';
import {
  getModelDefinitions,
} from './configurations/model-definitions.mjs';
import {
  getTransformDefinitions,
} from './configurations/transform-definitions.mjs';
import {
  BASE_TRANSFORM_DEFINITION_KEY,
  PATTERNS_MODEL_DEFINITION_KEY,
} from './constants.mjs';
import {
  type ListDependenciesOptions,
  listSpecificationArtifacts,
} from './list-artifacts.mjs';
import {
  getDependencyModelMasks,
} from './mask/dependencies-masks.mjs';

/** Options for Generate OpenAPI Manifest Schema function */
export interface GenerateOpenApiManifestSchemaOptions extends ListDependenciesOptions {
}

/**
 * Generate Ama-openapi Manifest schema to provide autocompletion and structure validation for the Specification manifest files
 * @param options
 */
export const generateOpenApiManifestSchema = async (options: GenerateOpenApiManifestSchemaOptions & Context) => {
  const artifacts = await listSpecificationArtifacts(options);

  const manifestModelsProperties = getManifestModelsProperties(artifacts);
  const modelDefinitions = getModelDefinitions(artifacts);
  const transformDefinitions = getTransformDefinitions(artifacts);
  const masks = await getDependencyModelMasks(artifacts, options);

  return {
    masks,
    manifest: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'OpenApi specification package manifest',
      $id: '@ama-openapi/core/schemas/manifest.schema.json',
      type: 'object',
      properties: {
        models: {
          type: 'object',
          description: 'Dependency package containing the specification to include',
          properties: manifestModelsProperties
        }
      },
      additionalProperties: true,
      definitions: {
        [BASE_TRANSFORM_DEFINITION_KEY]: {
          type: 'object',
          examples: [
            {
              rename: 'MyPrefix_$1'
            }
          ],
          properties: {
            rename: {
              type: 'string',
              description: 'Rename the outputted file. The keyword `$1` can be used to refer to the original name (ex: a prefix would be `my-prefix-$1`)',
              examples: [
                'my-prefix-$1',
                'myModel.v1.yaml'
              ]
            }
          }
        },
        [PATTERNS_MODEL_DEFINITION_KEY]: {
          type: 'object',
          description: 'Detailed model patterns inclusion',
          properties: {
            patterns: {
              oneOf: [
                {
                  type: 'array',
                  description: "Glob patterns to match models to include. The patterns are relative to the artifact root (e.g., 'models/**/*.yaml')",
                  items: {
                    type: 'string'
                  }
                },
                {
                  type: 'string',
                  description: "Glob pattern to match models to include. The pattern is relative to the artifact root (e.g., 'models/**/*.yaml')"
                }
              ]
            }
          },
          required: [
            'patterns'
          ],
          additionalProperties: false
        },
        ...modelDefinitions,
        ...transformDefinitions
      }
    }
  };
};
