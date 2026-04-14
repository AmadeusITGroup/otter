import type {
  PathObject,
} from '@ama-sdk/core';
import type {
  OpenAPIV2,
  OpenAPIV3,
  OpenAPIV3_1,
} from 'openapi-types';

/**
 * Parse a single specification to retrieve the Operation Finder information
 * This function is properly working to a specification that does not include external references in the Paths object
 * @param specification Specification single object to parse
 */
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
      const pathObject: Record<OpenAPIV2.HttpMethods, OpenAPIV2.OperationObject | OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject> = pathObjectOrRef.$ref
        ? (pathObjectOrRef.$ref as string).replace(/^#\/?/, '').split('/').reduce((acc: any, ref) => acc[ref], specification)
        : pathObjectOrRef;
      const urlPattern = `${path.replace(/{[^}]+}/g, '((?:[^/]+?))')}(?:/(?=$))?$`;
      return {
        path,
        urlPattern,
        regexp: new RegExp(`^${(basePath + urlPattern).replace(/^\/{2,}/, '/')}`),
        operations: Object.entries(pathObject)
          .map(([method, reqObject]) => ({
            method,
            operationId: reqObject.operationId
          }))
      } satisfies PathObject;
    });
};
