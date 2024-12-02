import * as path from 'node:path';
import {
  fragment,
  type JsonObject,
} from '@angular-devkit/core';
import {
  apply,
  applyToSubtree,
  chain,
  MergeStrategy,
  mergeWith,
  noop,
  renameTemplateFiles,
  type Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import type {
  WorkspaceSchema,
} from '@o3r/schematics';
import {
  updateOrAddTsconfigEslint,
} from '../tsconfig/index';

const editAngularJson = (projectName: string, extension: string): Rule => async (tree, context) => {
  let workspace: WorkspaceSchema | null = null;
  try {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    workspace = getWorkspaceConfig(tree);
  } catch {
    context.logger.warn(`No @o3r/schematics installed, we could not detect the workspace. The linter task for ${projectName} can not be added.`);
  }
  const workspaceProject = workspace?.projects[projectName];
  if (!workspaceProject) {
    context.logger.warn(`No project detected, the linter task for ${projectName} can not be added.`);
    return;
  }

  workspaceProject.architect ||= {};
  workspaceProject.architect.lint ||= {
    builder: '@angular-eslint/builder:lint',
    options: {
      eslintConfig: `${workspaceProject.root}/eslint.config.${extension}`,
      lintFilePatterns: [
        `${workspaceProject.sourceRoot || path.posix.join(workspaceProject.root, 'src')}/**/*.ts`
      ]
    }
  };

  workspace!.projects[projectName] = workspaceProject;
  tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
};

/**
 * Update ESLint Config
 * @param rootPath
 * @param projectName
 */
export const updateEslintConfig = (rootPath: string, projectName?: string): Rule => async (tree, context) => {
  const { findFilesInTree, getTemplateFolder, getWorkspaceConfig } = await import('@o3r/schematics');
  const workspace = getWorkspaceConfig(tree);
  const workspaceProject = workspace?.projects[projectName || ''];
  const projectRootPath = workspaceProject?.root || '.';
  const workingDir = tree.getDir(projectRootPath);
  const eslintConfigFiles = findFilesInTree(workingDir, (file) => /eslint.config.[cm]?js/.test(file));
  if (eslintConfigFiles.length > 1) {
    context.logger.warn(
      'Unable to add the "@o3r/eslint-config" recommendation because several ESLint config file detected.\n'
      + eslintConfigFiles.map((file) => `\t- ${file.path.toString()}`).join('\n')
    );
    return;
  }

  const templateOptions = {
    extension: 'mjs',
    codeBeforeConfig: '',
    codeAfterConfig: '',
    oldConfig: '',
    relativePathToRoot: path.posix.relative(projectRootPath, '.'),
    packageName: (tree.readJson(workingDir.file(fragment('package.json'))?.path || 'package.json') as JsonObject).name,
    detectedTsConfigs: findFilesInTree(workingDir, (f) => /tsconfig\..*\.json/.test(f)).map((entry) => path.basename(entry.path)).concat('tsconfig.eslint.json'),
    isApp: workspaceProject?.projectType === 'application'
  };

  if (eslintConfigFiles.length === 1) {
    const file = eslintConfigFiles[0];
    const filePath = file.path.toString();
    const fileContent = file.content.toString();
    const extension = path.extname(filePath) as 'mjs' | 'cjs' | 'js';
    const regexp = extension === 'mjs' ? /export\s+default\s+[^;]*;/ : /module.exports\s*=\s*[^;]*;/;
    const [codeBeforeConfig, codeAfterConfig] = fileContent.split(regexp);
    if (!codeAfterConfig) {
      context.logger.warn(
        `Unable to add the "@o3r/eslint-config" recommendation because no ESLint config detected in ${filePath}`
      );
      return;
    }
    const oldConfig = fileContent.match(regexp)![1];
    templateOptions.extension = extension;
    templateOptions.codeBeforeConfig = codeBeforeConfig;
    templateOptions.codeAfterConfig = codeAfterConfig;
    templateOptions.oldConfig = oldConfig;
    tree.delete(filePath);
  }

  return chain([
    projectName ? editAngularJson(projectName, templateOptions.extension) : noop(),
    applyToSubtree(
      projectRootPath,
      [
        updateOrAddTsconfigEslint(rootPath),
        mergeWith(apply(url(getTemplateFolder(rootPath, __dirname, `./templates/${projectRootPath === '.' ? 'workspace' : 'project'}`)), [
          template(templateOptions),
          renameTemplateFiles()
        ]), MergeStrategy.Overwrite)
      ]
    )
  ]);
};
