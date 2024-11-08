import {
  posix,
} from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  type Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import type {
  GenerateStyleSchematicsSchema,
} from '../../../builders/generate-style/schema';

/**
 * Register the Design Token CSS generator
 * @param projectName Project name
 * @param taskName name of the task to generate
 */
export const registerGenerateCssBuilder = (projectName?: string, taskName = 'generate-css'): Rule => {
  const registerBuilderRule: Rule = async (tree, { logger }) => {
    const { getWorkspaceConfig, registerBuilder } = await import('@o3r/schematics');
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = projectName ? workspace?.projects[projectName] : undefined;
    const workspaceRootPath = workspaceProject?.root || '.';
    const srcBasePath = workspaceProject?.sourceRoot || posix.join(workspaceRootPath, 'src');
    const themeFile = posix.join(srcBasePath, 'style', 'theme.scss');
    const taskOptions: GenerateStyleSchematicsSchema = {
      language: 'css',
      defaultStyleFile: themeFile,
      templateFile: posix.join(workspaceRootPath, 'design-token.template.json'),
      designTokenFilePatterns: [
        posix.join(srcBasePath, 'style', '*.json'),
        posix.join(srcBasePath, '**', '*.theme.json')
      ]
    };
    const taskParameters = {
      builder: '@o3r/design:generate-css',
      options: taskOptions,
      configurations: {
        watch: { watch: true }
      }
    };
    if (!workspaceProject) {
      logger.warn(`No angular.json found, the task ${taskName} will not be created`);
      return;
    }
    registerBuilder(workspaceProject, taskName, taskParameters);
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
  };

  const generateDesignTokenFilesRule: Rule = async (tree) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.join(workspaceProject.root, 'src') : './src');
    const themeFolder = posix.join(srcBasePath, 'style');
    return mergeWith(apply(url('./register-generate-css/templates'), [
      template({}),
      renameTemplateFiles(),
      move(themeFolder)
    ]), MergeStrategy.Overwrite);
  };

  const generateTemplateFilesRule: Rule = async (tree) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const workspaceRootPath = workspaceProject?.root || '.';
    return mergeWith(apply(url('./register-generate-css/templates-workspace'), [
      template({}),
      renameTemplateFiles(),
      move(workspaceRootPath)
    ]), MergeStrategy.Overwrite);
  };

  const importTheme: Rule = async (tree, context) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
    const srcBasePath = workspaceProject?.sourceRoot || (workspaceProject?.root ? posix.join(workspaceProject.root, 'src') : './src');
    const styleFile = posix.join(srcBasePath, 'styles.scss');
    if (!tree.exists(styleFile)) {
      context.logger.warn(`The theme was not updated as ${styleFile} was not found`);
      return;
    }
    tree.overwrite(styleFile, '@import "./style/theme.scss";\n' + tree.readText(styleFile));
  };

  return chain([
    registerBuilderRule,
    generateDesignTokenFilesRule,
    generateTemplateFilesRule,
    importTheme
  ]);
};
