/* eslint-disable @typescript-eslint/naming-convention */
import {
  chain, Rule, Tree
} from '@angular-devkit/schematics';
import { readAngularJson } from '@o3r/schematics';
import * as commentJson from 'comment-json';

/**
 * Update otter builders names
 */
export function updateBuildersNames(): Rule {

  /**
   * Change otter builders names into angular.json
   *
   * @param tree
   */
  const updateAngularJson: Rule = (tree: Tree) => {
    const workspace = readAngularJson(tree);

    const projectsInAngularJson = Object.keys(workspace.projects);
    const buildersMappingFromV7 = {
      '@otter/cms-adapters:component-extractor': '@o3r/components:extractor',
      '@otter/cms-adapters:localization-extractor': '@o3r/localization:extractor',
      '@otter/cms-adapters:style-extractor': '@o3r/styling:extractor',
      '@otter/cms-adapters:rules-engine-extractor': 'o3r/rules-engine:extractor',
      '@otter/ng-tools:i18n': '@o3r/localization:i18n',
      '@otter/ng-tools:localization': '@o3r/localization:localization',
      '@otter/ng-tools:app-version': '@o3r/core:app-version',
      '@otter/ng-tools:multi-watcher': '@o3r/core:multi-watcher',
      '@otter/ng-tools:lib-build': '@o3r/core:lib-build',
      '@otter/ng-tools:ngc': '@o3r/core:ngc'
    };

    projectsInAngularJson.forEach(projectName => {
      const workspaceProject = workspace.projects[projectName];
      if (workspaceProject.architect) {
        Object.keys(workspaceProject.architect).forEach(architectName => {
          const builderName: string = workspaceProject.architect![architectName].builder;
          if (buildersMappingFromV7[builderName]) {
            workspaceProject.architect![architectName].builder = buildersMappingFromV7[builderName];
          }
        });
        workspace.projects[projectName] = workspaceProject;
      }
    });

    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  return chain([
    updateAngularJson
  ]);
}
