import type {
  Rule
} from '@angular-devkit/schematics';
import {
  findFilesInTree
} from '@o3r/schematics';
import {
  LOCAL_SPEC_FILENAME
} from '../../../helpers/generators';

/**
 * Update Regen Script to base remove 'swagger' keyword
 * @param tree
 */
export const updateOpenapitoolsFile: Rule = (tree) => {
  const files = findFilesInTree(tree.root, (p) => p.endsWith('openapitools.json'));

  files.forEach((file) => {
    const configFileContent = tree.readText(file.path);

    if (configFileContent.includes('swagger-spec.yaml')) {
      tree.overwrite(file.path, configFileContent.replace(/swagger-spec\.yaml/g, `${LOCAL_SPEC_FILENAME}.yaml`));
    }
  });
};
