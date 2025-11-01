import {
  isAbsolute,
  resolve,
} from 'node:path';
import {
  dirname,
  relative,
} from 'node:path/posix';
import {
  REF_REWRITE_PROPERTY_KEY,
} from '../../constants.mjs';
import type {
  Logger,
} from '../../logger.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

const isRelativePath = (path: string): boolean => {
  return !URL.canParse(path) && !isAbsolute(path);
};

type AdditionalAnnotation = {
  [REF_REWRITE_PROPERTY_KEY]: boolean;
};

/**
 * Update the $ref references in the specification to be relative to the model path
 * @param specification
 * @param receivedModel
 * @param _logger
 */
export const updateReferences = <S extends object>(specification: S, receivedModel: RetrievedDependencyModel, _logger?: Logger): S & AdditionalAnnotation => {
  let hasTouchedReference = false;
  const walkSpecification = <T,>(specItem: T): T => {
    if (typeof specItem === 'object') {
      if (specItem === null) {
        return specItem;
      }

      if (Array.isArray(specItem)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- due to unknown object structure
        return specItem.map((item) => walkSpecification(item)) as T;
      }

      return Object.fromEntries(Object.entries(specItem as object).map(([key, value]) => {
        if (key === '$ref' && typeof value === 'string' && isRelativePath(value)) {
          value = relative(dirname(receivedModel.outputFilePath), resolve(dirname(receivedModel.modelPath), value));
          hasTouchedReference = true;
        }
        return [key, walkSpecification(value)];
      })) as T;
    }
    return specItem;
  };

  return {
    ...walkSpecification(specification),
    [REF_REWRITE_PROPERTY_KEY]: hasTouchedReference
  };
};
