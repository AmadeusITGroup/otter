import {
  basename,
} from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';

/**
 * Update Otter cms.json in an Angular Project
 */
export function updateCmsJsonFile(): Rule {
  return (tree, context) => {
    const filesToUpdate: Record<string, any> = {};

    tree.visit((path) => {
      if (basename(path) === 'cms.json') {
        try {
          const contentObj: any = tree.readJson(path);
          if (typeof contentObj === 'object' && !contentObj.$schema) {
            filesToUpdate[path] = contentObj;
          }
        } catch {
          context.logger.warn(`Failed to parse '${path}'`);
        }
      }
    });

    Object.entries(filesToUpdate).forEach(([path, contentObj]) => {
      contentObj.$schema = 'https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/application/schemas/cms.schema.json';
      tree.overwrite(path, JSON.stringify(contentObj, null, 2));
    });
    return tree;
  };
}
