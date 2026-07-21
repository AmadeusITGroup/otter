import {
  basename,
} from 'node:path/posix';
import {
  PATTERNS_MODEL_DEFINITION_KEY,
} from '../constants.mjs';
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
      const getModelRef = (modelName: string) => ({
        oneOf: [
          {
            $ref: `#/definitions/${modelName}`
          },
          {
            $ref: `#/definitions/${PATTERNS_MODEL_DEFINITION_KEY}`
          }
        ]
      });
      return [
        packageManifestName,
        {
          oneOf: [
            ...refModels.map((ref) => getModelRef(ref)),
            { type: 'array', items: { oneOf: refModels.map((ref) => getModelRef(ref)) } }
          ]
        }
      ];
    })
      .filter(([key]) => key !== undefined)
  );
};
