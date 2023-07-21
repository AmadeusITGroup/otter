import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getProjectFromTree, readAngularJson } from '@o3r/schematics';

/**
 * Add the mandatory targetBuild property for the prefetch builder
 */
export function updatePrefetchTargetBuild(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const workspaceProject = getProjectFromTree(tree, null, 'application');
    if (!workspaceProject) {
      return tree;
    }
    const { name, ...newProject } = workspaceProject;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const defaultTargetBuild = `${name}:build:production`;
    if (newProject.architect) {
      for (const builder of Object.keys(newProject.architect)) {
        const builderObj = newProject.architect[builder];
        if (builderObj && builderObj.builder === '@otter/ng-tools:prefetch' && !builderObj.options.targetBuild) {
          newProject.architect[builder].options = {
            ...newProject.architect[builder].options,
            targetBuild: defaultTargetBuild
          };
        }
      }

      workspace.projects[name] = newProject;
      tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
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
    const workspaceProject = getProjectFromTree(tree, null, 'application');
    if (!workspaceProject) {
      return tree;
    }
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
    const { name, ...newProject } = workspaceProject;
    workspace.projects[name] = newProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };
}
