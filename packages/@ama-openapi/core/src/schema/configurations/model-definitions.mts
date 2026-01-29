import {
  basename,
} from 'node:path';
import {
  generateModelNameRef,
} from '../generate-model-name.mjs';
import type {
  SpecificationArtifact,
} from '../list-artifacts.mjs';

/**
 * Generate model definitions for the given artifacts
 * @param artifacts
 */
export const getModelDefinitions = (artifacts: SpecificationArtifact[]) => {
  return Object.fromEntries(
    artifacts.flatMap(({ packageManifest, models, baseDirectory }) => {
      const packageManifestName = packageManifest.name || basename(baseDirectory);
      return models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => {
          const modelRef = generateModelNameRef(packageManifestName, model);
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
};
