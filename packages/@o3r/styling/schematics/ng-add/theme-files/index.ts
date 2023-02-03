import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { getProjectFromTree, getTemplateFolder, readAngularJson, writeAngularJson } from '@o3r/schematics';

/**
 * Added styling support
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateThemeFiles(rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);

    let currentStyleFile = '';
    let mainStyleName = 'styles.scss';
    let mainStyleFolder = 'src/';
    if (workspaceProject.architect &&
      workspaceProject.architect.build &&
      workspaceProject.architect.build.options &&
      workspaceProject.architect.build.options.styles &&
      workspaceProject.architect.build.options.styles[0] &&
      tree.exists(workspaceProject.architect.build.options.styles[0])) {

      const mainStylePath = workspaceProject.architect.build.options.styles[0];
      mainStyleName = path.basename(mainStyleName, '.scss').replace(/\.scss$/i, '');
      mainStyleFolder = path.dirname(mainStylePath);
      currentStyleFile = tree.read(mainStylePath)!.toString();
      if (currentStyleFile.indexOf('./styling/theme') > -1) {
        return tree;
      }
      tree.delete(mainStylePath);
    }

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        currentStyleFile,
        mainStyleName
      }),
      move(mainStyleFolder)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);

    const npmClient = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
    context.logger.info(`Otter library requires Angular Material, you can install it with "${npmClient} ng add @angular/material"`);

    return rule(tree, context);
  };

}

/**
 * Update assets list in angular.json for styling
 *
 * @param options
 * @returns
 */
export function removeV7OtterAssetsInAngularJson(options: { projectName: string | null }): Rule {

  return (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName);

    // exit if not an application
    if (workspaceProject.projectType !== 'application') {
      context.logger.debug('This is not an application project. No need to search and remove old v7 otter styling assets reference.');
      return tree;
    }

    if (workspaceProject?.architect?.build?.options?.assets) {
      workspaceProject.architect.build.options.assets =
        workspaceProject.architect.build.options.assets.filter((a: { glob: string; input: string; output: string }) => !a.input || a.input.indexOf('node_modules/@otter/styling/assets') === -1);
    }

    workspace.projects[projectName] = workspaceProject;
    return writeAngularJson(tree, workspace);
  };
}
