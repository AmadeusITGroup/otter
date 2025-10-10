import { isDependencyLink, type Dependency, type Model } from "../public_api.mjs";
import { applyMask } from "./apply-mask.mjs";
import { deserialize, serialize } from "./loader.mjs";
import { mapReferences } from "./map-references.mjs";

export interface TransformContext {
  dependency: Dependency;
  url: string;
  modelPath: string;
  model?: Model;
}

/**
 * Apply the transformation to the model content
 * @returns
 */
export const transform = (modelContent: string, context: TransformContext): string => {
  const { dependency, url, model, modelPath } = context;
  const {format, obj: modelObj } = deserialize(modelContent);
  const mask = model?.mask || (isDependencyLink(dependency) ? dependency.mask : undefined);
  const referenceMap = model?.referenceMapping || (isDependencyLink(dependency) ? dependency.referenceMapping : undefined);

  let transformedModel = modelObj;
  transformedModel = applyMask(transformedModel, url, mask);
  transformedModel = mapReferences(transformedModel, modelPath, referenceMap);

  return serialize(format, transformedModel);
};
