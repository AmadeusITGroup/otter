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
};
