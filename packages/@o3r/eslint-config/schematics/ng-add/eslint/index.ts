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
  renameTemplateFiles,
  type Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  findFilesInTree,
  getTemplateFolder,
  getWorkspaceConfig,
} from '@o3r/schematics';
import type {
  WorkspaceSchema,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

/**
 * Setup the lint task in the angular.json file
 * @param projectName
 * @param extension
 */
const editAngularJson = (projectName: string, extension: string): Rule => (tree, context) => {
  let workspace: WorkspaceSchema | null = null;
  try {
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
        `${workspaceProject.root}/**/*.{m,c,}{j,t}s`,
        `${workspaceProject.root}/**/*.json`,
        `${workspaceProject.root}/**/*.html`
      ]
    }
  };

  workspace!.projects[projectName] = workspaceProject;
  tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
};

/**
 * Add the lint task in the package.json
 * @param projectPath
 * @param projectName
 */
const editPackageJson = (projectPath: string, projectName: string): Rule => (tree) => {
  const packageJsonPath = path.posix.join(projectPath, 'package.json');
  const packageJson = tree.readJson(packageJsonPath) as PackageJson;
  packageJson.scripts ??= {};
  packageJson.scripts.lint ??= `ng lint ${projectName}`;
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

const isInstalled = (packageName: string): boolean => {
  try {
    require.resolve(packageName);
  } catch {
    return false;
  }
  return true;
};

/**
 * Update ESLint Config
 * @param rootPath
 * @param projectName
 */
export const updateEslintConfig = (rootPath: string, projectName?: string): Rule => (tree, context) => {
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
    playwrightInstalled: isInstalled('playwright'),
    jest: isInstalled('jest'),
    codeAfterConfig: '',
    oldConfig: '',
    relativePathToRoot: path.posix.relative(projectRootPath, '.'),
    packageName: (tree.readJson(workingDir.file(fragment('package.json'))?.path || 'package.json') as JsonObject).name,
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
    ...projectName
      ? [
        editAngularJson(projectName, templateOptions.extension),
        editPackageJson(projectRootPath, projectName)
      ]
      : [],
    applyToSubtree(
      projectRootPath,
      [
        mergeWith(apply(url(getTemplateFolder(rootPath, __dirname, `./templates/${projectRootPath === '.' ? 'workspace' : 'project'}`)), [
          template(templateOptions),
          renameTemplateFiles()
        ]), MergeStrategy.Overwrite)
      ]
    )
  ]);
};
