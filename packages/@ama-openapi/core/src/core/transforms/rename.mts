import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Rename the title of the specification
 * @param specification
 * @param retrievedModel
 * @param context
 */
export const renameTitle = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, context: Context): S => {
  const { logger } = context;
  if (retrievedModel.transform?.titleRename) {
    logger?.debug?.(`Renaming title in model from ${retrievedModel.artifactName} at ${retrievedModel.modelPath}`);
    let title: string | undefined = 'title' in specification ? specification.title as string : undefined;
    title = title && title.replace(new RegExp(`^(${title})$`), retrievedModel.transform.titleRename);
    specification = {
      ...specification,
      title
    };
  }
  return specification;
};
