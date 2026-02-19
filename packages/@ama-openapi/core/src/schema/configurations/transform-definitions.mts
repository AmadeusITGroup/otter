import {
  basename,
} from 'node:path';
import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';
import type {
  SpecificationArtifact,
} from '../list-artifacts.mjs';

/**
 * Generate transform definitions for the given artifacts
 * @param artifacts
 */
export const getTransformDefinitions = (artifacts: SpecificationArtifact[]) => {
  return Object.fromEntries(
    artifacts.flatMap(({ packageManifest, models, baseDirectory }) => {
      return models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => {
          const packageManifestName = packageManifest.name || basename(baseDirectory);
          const modelRef = generateModelNameRef(packageManifestName, model);
          const maskSchemaFileName = getMaskFileName(modelRef);
          return [
            `transform-${modelRef}`,
            {
              description: `Transformations to apply to the model "${model}" from package "${packageManifestName}"`,
              allOf: [
                {
                  $ref: '#/definitions/baseTransform'
                },
                {
                  type: 'object',
                  properties: {
                    mask: {
                      description: `The JSON Schema of the mask to apply to the model "${model}" from package "${packageManifestName}".\n`
                        + 'The mask schema is generated based on the model structure.\n'
                        + 'It can be used to specify which properties to include or exclude from the model, as well as to apply transformations to the included properties.',
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
};
