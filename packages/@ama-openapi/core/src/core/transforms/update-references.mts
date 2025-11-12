import {
  basename,
  dirname,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';
import {
  GENERATED_REF_PROPERTY_KEY,
  REF_REWRITTEN_PROPERTY_KEY,
} from '../../constants.mjs';
import type {
  Context,
} from '../../context.mjs';
import {
  isRelativePath,
} from '../file-system/relative-path.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';
import type {
  SpecificationFile,
} from './transform.mjs';

/**
 * Update the $ref references in the specification to be relative to the model path
 * @param specification
 * @param receivedModel
 * @param context
 */
export const updateReferences = <S extends SpecificationFile>(specification: S, receivedModel: RetrievedDependencyModel, context: Context): S => {
  const { logger } = context;
  const walkSpecification = <T extends S | object>(specItem: T): T => {
    if (typeof specItem === 'object') {
      if (specItem === null) {
        return specItem;
      }

      if (Array.isArray(specItem)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- due to unknown object structure
        return specItem.map((item) => walkSpecification(item)) as T;
      }

      let hasTouchedReference = false;
      const newSpecItem = Object.fromEntries(Object.entries(specItem as object).map(([key, value]) => {
        if (key === '$ref' && typeof value === 'string' && isRelativePath(value)) {
          if (GENERATED_REF_PROPERTY_KEY in specItem && !!specItem[GENERATED_REF_PROPERTY_KEY]) {
            logger?.debug?.(`Skipping the rewriting of the generated $ref reference "${value}" in model from ${receivedModel.artifactName} at ${receivedModel.modelPath}`);
          } else {
            if (value.startsWith('#')) {
              const localRefItem = value.slice(1).split('/').reduce((acc: any, part) => part ? acc?.[part] : acc, specification);
              if (localRefItem) {
                logger?.debug?.(
                  `The local reference "${value}"  in model from ${receivedModel.artifactName} at ${receivedModel.modelPath} `
                  + 'is still valid, no rewriting needed'
                );
                return [key, value];
              }
              logger?.debug?.(
                `The local reference "${value}"  in model from ${receivedModel.artifactName} at ${receivedModel.modelPath} `
                + 'is not valid anymore, the original model will be used as base for rewriting'
              );
              value = basename(receivedModel.modelPath) + value;
            }
            const rewrittenReference = relative(dirname(receivedModel.outputFilePath), resolve(dirname(receivedModel.modelPath), value)).replaceAll(sep, posix.sep);
            logger?.debug?.(`Rewriting $ref reference "${value}" to "${rewrittenReference}" in model from ${receivedModel.artifactName} at ${receivedModel.modelPath}`);
            value = rewrittenReference;
            hasTouchedReference = true;
          }
          return [key, value];
        }
        return [key, walkSpecification(value)];
      })) as T;
      return {
        ...newSpecItem,
        ...(hasTouchedReference ? { [REF_REWRITTEN_PROPERTY_KEY]: true } : {})
      };
    }
    return specItem;
  };

  return walkSpecification(specification);
};
