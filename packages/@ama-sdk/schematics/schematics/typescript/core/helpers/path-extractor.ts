import type {
  PathObject
} from '@ama-sdk/core';
import type {
  OpenAPIV2,
  OpenAPIV3,
  OpenAPIV3_1
} from 'openapi-types';

/**
 * Parse a single specification to retrieve the Operation Finder information
 * This function is properly working to a specification that does not include external references in the Paths object
 * @param specification Specification single object to parse
 */
// eslint-disable-next-line camelcase
export const generateOperationFinderFromSingleFile = (specification: OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document): PathObject[] => {
  if (!specification.paths) {
    return [];
  }
  let basePath = '/';
  if ('basePath' in specification && specification.basePath) {
    basePath = specification.basePath.replace(/\/$/, '');
  }

  return Object.entries(specification.paths)
    .filter(([, pathObject]) => !!pathObject)
    .map(([path, pathObjectOrRef]) => {
      // eslint-disable-next-line camelcase
      const pathObject: Record<OpenAPIV2.HttpMethods, OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject> = pathObjectOrRef.$ref
        ? (pathObjectOrRef.$ref as string).replace(/^#\/?/, '').split('/').reduce((acc: any, ref) => acc[ref], specification)
        : pathObjectOrRef;
      return {
        path,
        regexp: new RegExp(`^${(basePath + path).replace(/^\/{2,}/, '/').replace(/\{[^}]+}/g, '((?:[^/]+?))')}(?:/(?=$))?$`),
        operations: Object.entries(pathObject)
          .map(([method, reqObject]) => ({
            method,
            operationId: reqObject.operationId
          }))
      };
    });
};
