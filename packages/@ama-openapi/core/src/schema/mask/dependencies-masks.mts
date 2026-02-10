import {
  basename,
} from 'node:path/posix';
import type {
  Context,
} from '../../context.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from '../generate-model-name.mjs';
import type {
  SpecificationArtifact,
} from '../list-artifacts.mjs';
import {
  FIELD_SCHEMA_DEFINITION,
} from './field-schema.constants.mjs';
import {
  generateMaskSchemaModelAt,
} from './generate-mask-from-model.mjs';

/**
 * Generate masks schema for the dependency models from the given artifacts
 * @param artifacts List of specification artifacts
 * @param options
 */
export const getDependencyModelMasks = async (artifacts: SpecificationArtifact[], options: Context) => {
  const maskModelList = await Promise.all(
    artifacts.map(({ packageManifest, models, baseDirectory }) => {
      const filteredModels = models
        .filter((modelObj) => !!modelObj);
      const modelPaths = Object.fromEntries(filteredModels.map((m) => ([m.modelPath, m.model])));
      return Promise.all(filteredModels
        .map(async ({ model, modelPath }) => {
          const packageManifestName = packageManifest.name || basename(baseDirectory);
          const modelRef = generateModelNameRef(packageManifestName, model);
          const fileName = getMaskFileName(modelRef);
          const ctx = {
            ...options,
            modelPaths,
            packageName: packageManifestName
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
  );
  return maskModelList.flat();
};
