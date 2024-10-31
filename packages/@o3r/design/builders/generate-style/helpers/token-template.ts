import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  type DesignTokenGroupTemplate,
  mergeDesignTokenTemplates
} from '../../../src/public_api';
import { resolve } from 'node:path';
import type { BuilderContext } from '@angular-devkit/architect';

/**
 * Generate template object
 * @param templateFilePaths list of template files
 * @param context builder context
 */
export const generateTemplate = async (templateFilePaths: string[], context: BuilderContext): Promise<DesignTokenGroupTemplate> => {
  const templateFiles = await Promise.all(
    templateFilePaths
      .map(async (templateFile) => {
        let templateFilePath = resolve(context.workspaceRoot, templateFile);
        if (!existsSync(templateFilePath)) {
          try {
            templateFilePath = require.resolve(templateFile);
          } catch {
            context.logger.error(`Cannot resolve the template file at '${templateFile}', it will be ignored.`);
          }
        }
        return JSON.parse(await readFile(templateFilePath, { encoding: 'utf8' })) as DesignTokenGroupTemplate;
      })
  );
  return templateFiles.reduce((acc, cur) => mergeDesignTokenTemplates(acc, cur), {});
};
