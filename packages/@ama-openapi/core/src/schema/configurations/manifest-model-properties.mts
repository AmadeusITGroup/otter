import {
  basename,
} from 'node:path/posix';
import {
  generateModelNameRef,
} from '../generate-model-name.mjs';
import type {
  SpecificationArtifact,
} from '../list-artifacts.mjs';

/**
 * Generate manifest models properties for the given artifacts
 * @param artifacts
 */
export const getManifestModelsProperties = (artifacts: SpecificationArtifact[]) => {
  return Object.fromEntries(
    artifacts.map(({ packageManifest, models, baseDirectory }) => {
      const packageManifestName = packageManifest.name || basename(baseDirectory);
      const refModels = models
        .filter((modelObj) => !!modelObj)
        .map(({ model }) => `model-${generateModelNameRef(packageManifestName, model)}`);
      if (refModels.length === 0) {
        return [];
      }
      return [
        packageManifestName,
        {
          oneOf: [
            ...refModels.map((modelName) => ({ $ref: `#/definitions/${modelName}` })),
            { type: 'array', items: { oneOf: refModels.map((modelName) => ({ $ref: `#/definitions/${modelName}` })) } }
          ]
        }
      ];
    })
      .filter(([key]) => key !== undefined)
  );
};
