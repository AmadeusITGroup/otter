import type {
  Context,
} from '../context.mjs';
import {
  writeModelFile,
} from './file-system/write-model.mjs';
import type {
  RetrievedDependencyModel,
} from './manifest/extract-dependency-models.mjs';
import {
  walkInnerPath,
} from './references/walk-innerpath.mjs';
import {
  deserialize,
  serialize,
} from './serialization.mjs';
import {
  addAnnotation,
} from './transforms/add-annotation.mjs';
import {
  applyMask,
} from './transforms/apply-mask.mjs';
import {
  renameTitle,
} from './transforms/rename.mjs';
import {
  toReference,
} from './transforms/to-reference.mjs';
import {
  updateReferences,
} from './transforms/update-references.mjs';

/**
 * Process a set of retrieved dependency models to apply transformations and write them to files
 * @param models
 * @param context
 */
export const processModel = (models: Promise<RetrievedDependencyModel>[], context: Context) => {
  const { logger } = context;
  return models
    .map(async (retrievedModelPromise) => {
      const retrievedModel = await retrievedModelPromise;
      logger?.debug?.(`Retrieved model from ${retrievedModel.artifactName} at ${retrievedModel.modelPath}`);

      const initialModelObj = walkInnerPath(deserialize(retrievedModel.content, retrievedModel), retrievedModel);
      if (!initialModelObj) {
        logger?.error?.(`Inner path '${retrievedModel.model.innerPath}' not found in model at ${retrievedModel.modelPath}`);
        throw new Error(`The path '${retrievedModel.model.path}' can not be resolved in the model at ${retrievedModel.artifactName}`);
      }
      const transforms = [toReference, addAnnotation, applyMask, updateReferences, renameTitle];
      const modelObj = await transforms.reduce(async (acc, transform) =>
        transform(await acc, retrievedModel, context), Promise.resolve(initialModelObj));
      return {
        ...retrievedModel,
        content: serialize(modelObj, retrievedModel)
      };
    })
    .map(async (processedModel) => {
      await writeModelFile(await processedModel, context);
    });
};
