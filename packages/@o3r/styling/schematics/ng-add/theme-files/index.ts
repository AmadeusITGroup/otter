import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';

/**
 * Added styling support
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateThemeFiles(rootPath: string, options: { projectName?: string | null | undefined }): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const { getTemplateFolder, getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!workspaceProject) {
      return noop;
    }

    let currentStyleFile = '';
    let mainStyleName = 'styles.scss';
    let mainStyleFolder = 'src/';
    const mainStylePath = workspaceProject?.architect?.build?.options?.styles?.find((filePath: string) =>
      workspaceProject?.root && filePath.startsWith(workspaceProject.root));
    if (mainStylePath && tree.exists(mainStylePath)) {
      mainStyleName = path.basename(mainStyleName, '.scss').replace(/\.scss$/i, '');
      mainStyleFolder = path.dirname(mainStylePath);
      currentStyleFile = tree.readText(mainStylePath);
      if (currentStyleFile.indexOf('./styling/theme') > -1) {
        return;
      }
      tree.delete(mainStylePath);
    }

    const npmClient = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
    context.logger.info(`Otter library requires Angular Material, you can install it with "${npmClient} ng add @angular/material"`);

    if (tree.exists(path.posix.join(mainStyleFolder, 'styling', mainStyleName)) ||
      tree.exists(path.posix.join(mainStyleFolder, 'styling', 'index.scss')) ||
      tree.exists(path.posix.join(mainStyleFolder, 'styling', '_index.scss')) ||
      tree.exists(path.posix.join(mainStyleFolder, 'styling', 'styling.scss')) ||
      tree.exists(path.posix.join(mainStyleFolder, 'styling', '_styling.scss'))
    ) { // do nothing if the styling is already in place
      return;
    }

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        currentStyleFile,
        mainStyleName: mainStyleName.replace('.scss', '')
      }),
      move(mainStyleFolder)
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);

    return rule;

  };

}

/**
 * Update assets list in angular.json for styling
 * @param options
 * @param options.projectName
 * @returns
 */
export function removeV7OtterAssetsInAngularJson(options: { projectName?: string | null | undefined }): Rule {

  return async (tree: Tree, context: SchematicContext) => {
    const { writeAngularJson, getWorkspaceConfig } = await import('@o3r/schematics');
    const workspace = getWorkspaceConfig(tree);
    const projectName = options.projectName;
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    // exit if not an application
    if (!projectName || !workspace || !workspaceProject) {
      context.logger.debug('This is not an application project. No need to search and remove old v7 otter styling assets reference.');
      return;
    }

    if (workspaceProject.architect?.build?.options?.assets) {
      workspaceProject.architect.build.options.assets =
        workspaceProject.architect.build.options.assets.filter((a: { glob: string; input: string; output: string }) => !a.input || a.input.indexOf('node_modules/@otter/styling/assets') === -1);
    }

    workspace.projects[projectName] = workspaceProject;
    writeAngularJson(tree, workspace);
  };
}
