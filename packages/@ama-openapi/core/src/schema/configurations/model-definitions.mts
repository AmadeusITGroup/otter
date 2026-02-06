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
 * Escape special characters in a string for use in a regular expression
 * Note: This function can be removed on node >= 24 as `RegExp.escape` will be available natively
 * @param str String to escape
 */
const regExpEscape = (str: string): string => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

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
          const pathSchemas = [
            {
              const: model,
              description: 'Path to the specific model to include as is. The path is relative to the artifact root (e.g., "models/ExampleModel.v1.yaml")'
            },
            {
              type: 'string',
              // TODO: give users hint on the available inner paths (cf #3938)
              pattern: `^${regExpEscape(model)}#/.*$`
            }
          ];

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
                ...pathSchemas,
                {
                  type: 'object',
                  description: 'Detailed model inclusion with optional transformations to apply',
                  properties: {
                    path: {
                      oneOf: pathSchemas
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
