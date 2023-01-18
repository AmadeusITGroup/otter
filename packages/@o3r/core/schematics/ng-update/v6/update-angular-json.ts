import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readAngularJson } from '@o3r/schematics';
import * as commentJson from 'comment-json';

/**
 * Add the mandatory targetBuild property for the prefetch builder
 */
export function updatePrefetchTargetBuild(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
    const defaultTargetBuild = `${projectName}:build:production`;
    const workspaceProject = getProjectFromTree(tree);
    if (workspaceProject.projectType !== 'application') {
      // no update for libraries
      return tree;
    } else if (workspaceProject.architect) {
      for (const builder of Object.keys(workspaceProject.architect)) {
        const builderObj = workspaceProject.architect[builder];
        if (builderObj && builderObj.builder === '@otter/ng-tools:prefetch' && !builderObj.options.targetBuild) {
          workspaceProject.architect[builder].options = {
            ...workspaceProject.architect[builder].options,
            targetBuild: defaultTargetBuild
          };
        }
      }
      workspace.projects[projectName] = workspaceProject;
      tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
      return tree;
    }
  };
}

/**
 * Update the i18n builder configuration
 */
export function updateI18nBuild(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree);
    if (workspaceProject.architect) {
      for (const builder of Object.keys(workspaceProject.architect)) {
        const builderObj = workspaceProject.architect[builder];
        if (builderObj && builderObj.builder === '@otter/ng-tools:i18n') {
          const { defaultLanguageFile, localizationFiles } = builderObj.options;
          const extraConfigurations = Object.values(builderObj.configurations || {})
            .map((config: any) => ({
              ...config,
              localizationFiles: config.localizationFiles || localizationFiles
            }));
          const localizationConfigs = [builderObj.options].concat(extraConfigurations);
          workspaceProject.architect[builder].options = {
            defaultLanguageFile,
            localizationConfigs
          };
        }
      }
    }
    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };
}
