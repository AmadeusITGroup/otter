import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  SpecificationFile,
} from './transform.mjs';

/**
 * Rename the title of the specification
 * @param specification
 * @param retrievedModel
 * @param context
 */
export const renameTitle = <S extends SpecificationFile>(specification: S, retrievedModel: RetrievedDependencyModel, context: Context): S & { title?: string } => {
  const { logger } = context;
  if (retrievedModel.transform?.titleRename) {
    logger?.debug?.(`Renaming title in model from ${retrievedModel.artifactName} at ${retrievedModel.modelPath}`);
    let title: string | undefined = specification.title ?? undefined;
    title = title?.replace(/^(.*)$/, retrievedModel.transform.titleRename);
    specification = {
      ...specification,
      title
    };
  }
  return specification;
};
