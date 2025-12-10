import {
  OUTPUT_DIRECTORY,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup (see #3738)
} from '@ama-openapi/core';
import {
  type CreateOptions,
  generateTemplate,
} from './generate-template';

/**
 * Generate design project
 * @param target
 * @param packageName
 * @param version
 */
export const generateDesign = (target: string, packageName: string, version: string) => {
  const options: CreateOptions = {
    target,
    externalModelPath: OUTPUT_DIRECTORY,
    version,
    templateDirectory: 'design',
    packageName,
    logger: console
  };
  return generateTemplate(options);
};
