import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';

import { getProjectFromTree, readAngularJson, readPackageJson } from '../../../../utility/loaders';

/**
 *
 */
export function updateCustomizationCmsAdapter(): Rule {
  const updateAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree);

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    if (workspaceProject.architect['extract-components']) {
      context.logger.info('Angular workspace configuration already contains "extract-components" configuration, skipping.');
      return tree;
    }

    const extractConfiguration = workspaceProject.architect['extract-configurations'];

    if (extractConfiguration) {
      workspaceProject.architect['extract-components'] = {
        builder: '@o3r/component:extractor',
        options: {...extractConfiguration.options, configOutputFile: extractConfiguration.options.outputFile}
      };
      delete workspaceProject.architect['extract-configurations'];
      delete workspaceProject.architect['extract-components'].options.outputFile;
    } else {
      workspaceProject.architect['extract-components'] = {
        builder: '@o3r/components:extractor',
        options: {
          tsConfig: './tsconfig.cms.json',
          libraries: []
        }
      };
    }

    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  const updatePackageJson = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);
    const packageJson = readPackageJson(tree, workspaceProject);
    packageJson.scripts ||= {};
    if (packageJson.scripts['cms-adapters:components']) {
      context.logger.info('package.json already contains "cms-adapters:components" script, skipping.');
      return tree;
    }

    if (packageJson.scripts['cms-adapters:metadata']) {
      packageJson.scripts['cms-adapters:metadata'] = packageJson.scripts['cms-adapters:metadata'].replace('cms-adapters:configurations', 'cms-adapters:components');
    } else {
      packageJson.scripts['cms-adapters:metadata'] = 'yarn cms-adapters:components && yarn cms-adapters:localizations';
    }

    if (packageJson.scripts['cms-adapters:configurations']) {
      packageJson.scripts['cms-adapters:components'] = packageJson.scripts['cms-adapters:configurations'].replace(':extract-configurations', ':extract-components');
      delete packageJson.scripts['cms-adapters:configurations'];
    } else {
      const workspace = readAngularJson(tree);
      const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
      packageJson.scripts['cms-adapters:components'] = `ng run ${projectName}:extract-components`;
    }

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

  return chain([
    updateAngularJson,
    updatePackageJson
  ]);
}
