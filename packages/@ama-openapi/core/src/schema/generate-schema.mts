import type {
  Context,
} from '../context.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from './generate-model-name.mjs';
import {
  type ListDependenciesOptions,
  listSpecificationArtifacts,
} from './list-artifacts.mjs';
import {
  FIELD_SCHEMA_DEFINITION,
  generateMaskSchemaModelAt,
} from './mask/generate-mask-from-model.mjs';

/** Options for Generate OpenAPI Manifest Schema function */
export interface GenerateOpenApiManifestSchemaOptions extends ListDependenciesOptions {
}

/**
 * Generate Ama-openapi Manifest schema to provide autocompletion and structure validation
 * @param options
 */
export const generateOpenApiManifestSchema = async (options: GenerateOpenApiManifestSchemaOptions & Context) => {
  const artifacts = await listSpecificationArtifacts(options);

  const modelsProperties = Object.fromEntries(
    artifacts.map(({ packageManifest, models }) => {
      const refModels = models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => `model-${generateModelNameRef(packageManifest.name!, model)}`);
      if (refModels.length === 0) {
        return [];
      }
      return [
        packageManifest.name!,
        {
          oneOf: [
            ...refModels.map((modelName) => ({ $ref: `#/definitions/${modelName}` })),
            { type: 'array', items: { oneOf: refModels.map((modelName) => ({ $ref: `#/definitions/${modelName}` })) } }
          ]
        }
      ];
    })
  );

  const modelDefinitions = Object.fromEntries(
    artifacts.flatMap(({ packageManifest, models }) => {
      return models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => {
          const modelRef = generateModelNameRef(packageManifest.name!, model);
          return [
            `model-${modelRef}`,
            {
              oneOf: [
                ...packageManifest.main
                  ? [{
                    type: 'boolean',
                    default: true,
                    description: 'Include the default model exposed by the artifact'
                  }]
                  : [],
                {
                  const: model
                },
                {
                  type: 'object',
                  description: 'Detailed model inclusion with optional transformations to apply',
                  properties: {
                    path: {
                      const: model,
                      description: "Path to the specific model to include as is. The path is relative to the artifact root (e.g., 'models/ExampleModel.v1.yaml')"
                    },
                    transform: {
                      $ref: `#/definitions/transform-${modelRef}`
                    }
                  },
                  required: [
                    'path'
                  ],
                  additionalProperties: false
                }
              ]
            }
          ];
        });
    })
  );

  const transformDefinitions = Object.fromEntries(
    artifacts.flatMap(({ packageManifest, models }) => {
      return models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => {
          const modelRef = generateModelNameRef(packageManifest.name!, model);
          const maskSchemaFileName = getMaskFileName(modelRef);
          return [
            `transform-${modelRef}`,
            {
              allOf: [
                {
                  $ref: '#/definitions/baseTransform'
                },
                {
                  type: 'object',
                  properties: {
                    mask: {
                      $ref: `./${maskSchemaFileName}`
                    }
                  }
                }
              ]
            }
          ];
        });
    })
  );

  const masks = (await Promise.all(
    artifacts.map(({ packageManifest, models }) => {
      const filteredModels = models
        .filter((modelObj) => !!modelObj);
      const modelPaths = Object.fromEntries(filteredModels.map((m) => ([m.modelPath, m.model])));
      return Promise.all(filteredModels
        .map(async ({ model, modelPath }) => {
          const modelRef = generateModelNameRef(packageManifest.name!, model);
          const fileName = getMaskFileName(modelRef);
          const ctx = {
            ...options,
            modelPaths,
            packageName: packageManifest.name!
          };
          return {
            mask: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              title: `OpenApi specification mask ${modelRef}`,
              $id: `@ama-openapi/core/schemas/${fileName}`,
              ...await generateMaskSchemaModelAt(modelPath, ctx),
              definitions: {
                ...FIELD_SCHEMA_DEFINITION
              }
            },
            fileName
          };
        })
      );
    })
  )).flat();

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
          properties: modelsProperties
        }
      },
      additionalProperties: true,
      definitions: {
        baseTransform: {
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
        ...modelDefinitions,
        ...transformDefinitions
      }
    }
  };
};
