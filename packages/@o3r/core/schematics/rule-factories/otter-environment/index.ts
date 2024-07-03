import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import type { PackageManager } from '@angular/cli/lib/config/workspace-schema';
import generateEnvironments from '@schematics/angular/environments/index';
import * as ts from 'typescript';
import { getPackageManager, getWorkspaceConfig, OTTER_ITEM_TYPES, readPackageJson, registerCollectionSchematics, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import { join, posix } from 'node:path';

/**
 * Update Otter environment variable for schematics
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.enableStorybook
 * @param options.enablePlaywright
 * @param options.enableStyling
 * @param options.enableAnalytics
 * @param options.workingDirectory
 * @param _rootPath
 */
export function updateOtterEnvironmentAdapter(
  options: {
    projectName?: string | null | undefined;
    enableStorybook?: boolean;
    enableStyling?: boolean;
    enableAnalytics?: boolean;
    workingDirectory?: string | null;
  },
  _rootPath: string
): Rule {

  /**
   * Add Configuration for schematics
   * @param tree
   * @param _context
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;
    if (!workspace || !workspaceProject) {
      context.logger.error('No application detected, the Otter environment will not be setup');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);
    const scope = packageJson.name!.split('/')[0];

    workspace.cli = workspace.cli || {};

    if (workspaceProject.projectType === 'application') {
      if (!workspaceProject.schematics) {
        workspaceProject.schematics = {};
      }

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].app;
        if (path) {
          workspaceProject.schematics![item] = {
            path: posix.join(workspaceProject.root, path),
            ...(workspaceProject.schematics![item] || {})
          };
        }
      });

      // force dist/ output folder for production build
      if (workspaceProject.architect && workspaceProject.architect.build) {
        workspaceProject.architect.build.configurations ||= {};
        workspaceProject.architect.build.configurations.production ||= {};
        workspaceProject.architect.build.configurations.production.outputPath ||= join(workspaceProject.root, 'dist');

        if (workspaceProject.architect.build.configurations.options &&
            workspaceProject.architect.build.configurations.options.outputPath &&
            /^dist([/].+)?/i.test(workspaceProject.architect.build.configurations.options.outputPath)) {
          workspaceProject.architect.build.configurations.options.outputPath ||= join(workspaceProject.root, 'dist-dev');
        }

      }

      workspace.projects[options.projectName!] = workspaceProject;
    } else {
      workspace.cli.packageManager ||= getPackageManager() as PackageManager;

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].lib ? `modules/${scope}/${TYPES_DEFAULT_FOLDER[item].lib!}` : null;
        if (path) {
          workspace.schematics![`${item}*`] = {
            path,
            ...(workspace.schematics![item] || {})
          };
        }
      });

    }
    registerCollectionSchematics(workspace, '@o3r/core');
    workspace.cli.analytics = false;

    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  const editTsConfigJson = (tree: Tree) => {
    if (tree.exists('/tsconfig.json')) {
      const tsConfig = ts.parseConfigFileTextToJson('/tsconfig.json', tree.readText('/tsconfig.json')).config;
      if (tsConfig.compilerOptions?.noPropertyAccessFromIndexSignature) {
        delete tsConfig.compilerOptions.noPropertyAccessFromIndexSignature;
      }
      tree.overwrite('/tsconfig.json', JSON.stringify(tsConfig, null, 2));
    }
    return tree;
  };

  /**
   * Use Angular CLI generator to create environment files
   * @param tree
   * @param context
   */
  const generateEnvironmentFiles = (tree: Tree, context: SchematicContext) => {

    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;
    if (!workspace || !workspaceProject) {
      context.logger.error('No application detected, the environment can not be generated');
      return tree;
    }

    if (tree.exists(posix.join(workspaceProject.root, 'src/environments/environment.ts'))) {
      return tree;
    }

    const projectName = options.projectName || Object.keys(workspace.projects)[0];
    const envBasePath = posix.join(workspaceProject.root, 'src', 'environments');
    const envDevFilePath = posix.join(envBasePath, 'environment.development.ts');
    if (!tree.exists(envDevFilePath)) {
      return generateEnvironments({project: projectName})(tree, context);
    }
    return tree;
  };

  /**
   * Update environment files to add `production` boolean
   * @param tree
   * @param _context
   */
  const editEnvironmentFiles = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!workspaceProject) {
      return tree;
    }

    const envBasePath = posix.join(workspaceProject.root, 'src', 'environments');
    const envDevFilePath = posix.join(envBasePath, 'environment.development.ts');

    if (!tree.exists(envDevFilePath)) {
      return tree;
    }

    const envDefaultFilePath = posix.join(envBasePath, 'environment.ts');
    const addProductionBoolean = (envFilePath: string, value: boolean) => {
      let envContent = tree.readText(envFilePath);
      if (!/production['"]?:\s*(true|false)/.test(envContent)) {
        envContent = envContent.replace(/(const environment = {)/, `$1\n  production: ${String(value)},\n`);
        tree.overwrite(envFilePath, envContent);
      }
    };
    addProductionBoolean(envDefaultFilePath, true);
    addProductionBoolean(envDevFilePath, false);
    return tree;
  };

  return chain([
    editAngularJson,
    editTsConfigJson,
    generateEnvironmentFiles,
    editEnvironmentFiles
  ]);
}
