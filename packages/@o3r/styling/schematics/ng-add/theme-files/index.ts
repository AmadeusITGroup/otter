import * as path from 'node:path';
import {
  strings,
} from '@angular-devkit/core';
import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  getTemplateFolder,
  getWorkspaceConfig,
} from '@o3r/schematics';

/**
 * Added styling support
 * @param rootPath @see RuleFactory.rootPath
 * @param options @see RuleFactory.options
 * @param options.projectName
 */
export function updateThemeFiles(rootPath: string, options: { projectName?: string | null | undefined }): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!workspaceProject || workspaceProject.projectType === 'library') {
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
      if (currentStyleFile.includes('./styling/theme')) {
        return;
      }
      tree.delete(mainStylePath);
    }

    const npmClient = process.env && process.env.npm_execpath && !process.env.npm_execpath.includes('yarn') ? 'npm' : 'yarn';
    context.logger.info(`Otter library requires Angular Material, you can install it with "${npmClient} ng add @angular/material"`);

    if (tree.exists(path.posix.join(mainStyleFolder, 'styling', mainStyleName))
      || tree.exists(path.posix.join(mainStyleFolder, 'styling', 'index.scss'))
      || tree.exists(path.posix.join(mainStyleFolder, 'styling', '_index.scss'))
      || tree.exists(path.posix.join(mainStyleFolder, 'styling', 'styling.scss'))
      || tree.exists(path.posix.join(mainStyleFolder, 'styling', '_styling.scss'))
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
