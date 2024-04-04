import { apply, chain, MergeStrategy, mergeWith, move, renameTemplateFiles, type Rule, template, url } from '@angular-devkit/schematics';
import type { GenerateCssSchematicsSchema } from '../../../builders/generate-css/schema';
import { posix } from 'node:path';

/**
 * Register the Design Token CSS generator
 * @param projectName Project name
 * @param taskName name of the task to generate
 */
export const registerGenerateCssBuilder = (projectName?: string, taskName = 'generate-css'): Rule => {
  const registerBuilderRule: Rule = async (tree, {logger}) => {
    const { getWorkspaceConfig, registerBuilder } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const themeFile = posix.resolve(srcBasePath, 'style', 'theme.scss');
    const taskOptions: GenerateCssSchematicsSchema = {
      defaultStyleFile: themeFile,
      renderPrivateVariableTo: 'sass',
      designTokenFilePatterns: [
        `${posix.resolve(srcBasePath, 'style', '*.json')}`,
        `${posix.resolve(srcBasePath, '**', '*.theme.json')}`
      ]
    };
    const taskParameters = {
      options: taskOptions,
      configuration: {
        watch: { watch: true }
      }
    };
    if (!workspaceProject) {
      logger.warn(`No angular.json found, the task ${taskName} will not be created`);
      return;
    }
    registerBuilder(workspaceProject, taskName, taskParameters);
  };

  const generateTemplateRule: Rule = async (tree) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const themeFolder = posix.resolve(srcBasePath, 'style');
    const rule = mergeWith(apply(url('./templates'), [
      template({}),
      move(themeFolder),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    return rule;
  };

  const importTheme: Rule = async (tree, context) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.resolve(workspaceProject.root, 'src') : '');
    const styleFile = posix.resolve(srcBasePath, 'styles.scss');
    if (!tree.exists(styleFile)) {
      context.logger.warn(`The theme was not updated as ${styleFile} was not found`);
      return;
    }
    tree.overwrite(styleFile, '@import "./style/theme.scss";\n' + tree.readText(styleFile));
  };

  return chain([
    registerBuilderRule,
    generateTemplateRule,
    importTheme
  ]);
};
