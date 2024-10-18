import type {
  Rule
} from '@angular-devkit/schematics';
import {
  findFilesInTree
} from '@o3r/schematics';
import type {
  PackageJson
} from 'type-fest';
import {
  LOCAL_SPEC_FILENAME
} from '../../../helpers/generators';

const SCRIPT_REGEN_LABEL = 'spec:regen';

/**
 * Update Regen Script to base remove 'swagger' keyword
 * @param tree
 */
export const updateRegenScript: Rule = (tree) => {
  const files = findFilesInTree(tree.root, (p) => p.endsWith('package.json'));

  files.forEach((file) => {
    const packageJson = tree.readJson(file.path) as PackageJson;
    if (!packageJson.scripts || !Object.keys(packageJson.scripts).includes(SCRIPT_REGEN_LABEL)) {
      return;
    }

    const swaggerFilePath = file.path.replace(/package\.json$/, 'swagger-spec.yaml');
    if (!tree.exists(swaggerFilePath)) {
      return;
    }

    packageJson.scripts[SCRIPT_REGEN_LABEL] = packageJson.scripts[SCRIPT_REGEN_LABEL]!.replace(/swagger-spec\.yaml/g, `${LOCAL_SPEC_FILENAME}.yaml`);
    tree.overwrite(file.path, JSON.stringify(packageJson, null, 2));

    const openApiFilePath = file.path.replace(/package\.json$/, `${LOCAL_SPEC_FILENAME}.yaml`);
    tree.rename(swaggerFilePath, openApiFilePath);
  });
};
