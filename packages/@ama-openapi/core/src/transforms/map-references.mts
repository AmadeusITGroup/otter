import { dirname, join, relative } from "node:path";
import type { ReferenceMapping } from "../manifest/manifest.mjs";

const REDIRECT_PROPERTY_NAME = 'x-internal-reference-rewrite';

type ReferenceMappingPatterns = (ReferenceMapping & { pattern: RegExp })[];

/**
 * Map the references path when matching the patterns defined in manifest
 * @param model
 * @param referenceMapping
 * @returns
 */
export const mapReferences = (model: any, modelPath: string, referenceMapping?: ReferenceMapping[]) => {
  let hasTouchedReference = false;
  const walkSpecification = (model: any, referenceMapping: ReferenceMappingPatterns): any => {
    if (typeof model === 'object') {
      if (model === null) {
        return model;
      }

      if (Array.isArray(model)) {
        return model.map((item) => walkSpecification(item, referenceMapping));
      }

      return Object.fromEntries(Object.entries(model).map(([key, value]) => {
        if (key === '$ref' && typeof value === 'string') {
          const matchingRegExp = referenceMapping.find(({ pattern }) => pattern.test(value as string));
          if (matchingRegExp) {
            value = join(relative(dirname(modelPath), matchingRegExp.destination), matchingRegExp.keepMatchingString ? value : value.replace(matchingRegExp.pattern, ''));
            hasTouchedReference = true;
          }
        }
        return [key, walkSpecification(value, referenceMapping)];
      }));
    }
    return model;
  }

  const regExps = referenceMapping
    ?.map((mapping) => ({ ...mapping, pattern: new RegExp(`^${mapping.pattern.replace(/^^/, '')}`) })) as ReferenceMappingPatterns | undefined;

  const modelUpdate = regExps ? walkSpecification(model, regExps) : model;
  modelUpdate[REDIRECT_PROPERTY_NAME] = hasTouchedReference;
  return modelUpdate;
}
