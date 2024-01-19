import { apply, chain, MergeStrategy, mergeWith, move, renameTemplateFiles, type Rule, template, url } from '@angular-devkit/schematics';
import { getWorkspaceConfig } from '@o3r/schematics';
import type { GenerateCssSchematicsSchema } from '../../../builders/generate-css/schema';
import { posix } from 'node:path';

/* for v9.6 migration only, it is integrated into @o3r/schematics package in v10 */
import type { SchematicOptionObject, WorkspaceProject } from '@o3r/schematics';
function registerBuilder(workspaceProject: WorkspaceProject, taskName: string, taskParameters: SchematicOptionObject, force = false): WorkspaceProject {
  workspaceProject.architect ||= {};
  if (workspaceProject.architect[taskName] && !force) {
    throw new Error(`The builder task ${taskName} already exist`);
  }
  workspaceProject.architect[taskName] = taskParameters;
  return workspaceProject;
}

/**
 * Register the Design Token CSS generator
 * @param projectName Project name
 * @param taskName name of the task to generate
 */
export const registerGenerateCssBuilder = (projectName?: string, taskName = 'generate-css'): Rule => {
  const registerBuilderRule: Rule = (tree, {logger}) => {
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const themeFile = posix.resolve(srcBasePath, 'style', 'theme.scss');
    const taskParameters: GenerateCssSchematicsSchema = {
      defaultStyleFile: themeFile,
      renderPrivateVariableTo: 'sass',
      designTokenFilePatterns: [
        `${posix.resolve(srcBasePath, 'style', '*.json')}`,
        `${posix.resolve(srcBasePath, '**', '*.theme.json')}`
      ]
    };
    if (!workspaceProject) {
      logger.warn(`No angular.json found, the task ${taskName} will not be created`);
      return tree;
    }
    registerBuilder(workspaceProject, taskName, taskParameters);
    return tree;
  };

  const generateTemplateRule: Rule = (tree, context) => {
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const themeFolder = posix.resolve(srcBasePath, 'style');
    const rule = mergeWith(apply(url('./templates'), [
      template({}),
      move(themeFolder),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite)(tree, context);

    return rule;
  };

  const importTheme: Rule = (tree, context) => {
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const styleFile = posix.resolve(srcBasePath, 'styles.scss');
    if (!tree.exists(styleFile)) {
      context.logger.warn(`The theme was not updated as ${styleFile} was not found`);
      return tree;
    }

    return tree.overwrite(styleFile, '@import "./style/theme.scss";\n' + tree.readText(styleFile));
  };

  return chain([
    registerBuilderRule,
    generateTemplateRule,
    importTheme
  ]);
};
