import type {
  Logger,
} from '../../logger.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Rename the title of the specification
 * @param specification
 * @param retrievedModel
 * @param _logger
 */
export const renameTitle = <S extends object>(specification: S, retrievedModel: RetrievedDependencyModel, _logger?: Logger): S => {
  if (retrievedModel.transform?.titleRename) {
    let title: string | undefined = 'title' in specification ? specification.title as string : undefined;
    title = title && title.replace(new RegExp(`^(${title})$`), retrievedModel.transform.titleRename);
    specification = {
      ...specification,
      title
    };
  }
  return specification;
};
