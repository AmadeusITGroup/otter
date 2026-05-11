import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  SpecificationFile,
} from '../transforms/transform.mjs';

/**
 * Walk the inner path of a model to get to the desired specification part
 * @param specification
 * @param retrievedModel
 */
export const walkInnerPath = (specification: SpecificationFile, retrievedModel: Pick<RetrievedDependencyModel, 'model'>): SpecificationFile | undefined => {
  const { model } = retrievedModel;
  const innerPath = model.innerPath;
  const parts = innerPath?.split('/').filter((part) => part.length > 0) || [];
  return parts.reduce((acc, part) => acc && typeof acc === 'object' ? acc[part] : undefined, specification);
};
