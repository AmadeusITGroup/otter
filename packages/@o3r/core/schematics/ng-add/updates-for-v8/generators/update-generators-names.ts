/* eslint-disable @typescript-eslint/naming-convention */
import {
  chain, Rule, Tree
} from '@angular-devkit/schematics';
import { readAngularJson, WorkspaceSchematics } from '@o3r/schematics';
import * as commentJson from 'comment-json';

const generatorsMappingFromV7 = {
  '@otter/ng-tools:component': '@o3r/core:component',
  '@otter/ng-tools:component-container': '@o3r/core:component-container',
  '@otter/ng-tools:component-presenter': '@o3r/core:component-presenter',
  '@otter/ng-tools:service': '@o3r/core:service',
  '@otter/ng-tools:store': '@o3r/core:store',
  '@otter/ng-tools:store-entity-async': '@o3r/core:store-entity-async',
  '@otter/ng-tools:store-entity-sync': '@o3r/core:store-entity-sync',
  '@otter/ng-tools:store-simple-async': '@o3r/core:store-simple-async',
  '@otter/ng-tools:store-simple-sync': '@o3r/core:store-simple-sync',
  '@otter/ng-tools:store-action': '@o3r/core:store-action',
  '@otter/ng-tools:schematics': '@o3r/core:schematics',
  '@otter/ng-tools:page': '@o3r/core:page',
  '@otter/ng-tools:schematics-update': '@o3r/core:schematics-update',
  '@otter/ng-tools:renovate-bot': '@o3r/core:renovate-bot',
  '@otter/ng-tools:storybook-component': '@o3r/core:storybook-component',
  '@otter/ng-tools:iframe-component': '@o3r/components:iframe-component',
  '@otter/ng-tools:playwright-scenario': '@o3r/testing:playwright-scenario',
  '@otter/ng-tools:playwright-sanity': '@o3r/testing:playwright-sanity'
};

function updateGeneratorsPackage(schematicsToUpdate: WorkspaceSchematics) {
  Object.keys(schematicsToUpdate).forEach(generatorName => {
    if (generatorsMappingFromV7[generatorName]) {
      (schematicsToUpdate[generatorsMappingFromV7[generatorName]] || {}).builder = schematicsToUpdate[generatorName];
      // delete the old egnerator entry
      delete schematicsToUpdate[generatorName];
    }
  });
}

/**
 * Update otter generators names
 */
export function updateOtterGeneratorsNames(): Rule {

  /**
   * Change otter generators names into angular.json
   *
   * @param tree
   */
  const updateAngularJson: Rule = (tree: Tree) => {
    const workspace = readAngularJson(tree);

    const projectsInAngularJson = Object.keys(workspace.projects);
    if (workspace.schematics) {
      updateGeneratorsPackage(workspace.schematics);
    }
    projectsInAngularJson.forEach(projectName => {
      if (workspace.projects[projectName].schematics) {
        updateGeneratorsPackage(workspace.projects[projectName].schematics!);
      }
    });

    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  return chain([
    updateAngularJson
  ]);
}
