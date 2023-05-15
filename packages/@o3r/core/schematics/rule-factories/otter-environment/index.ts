import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import type { PackageManager } from '@angular/cli/lib/config/workspace-schema';
import generateEnvironments from '@schematics/angular/environments/index';
import { getPackageManager, getProjectFromTree, OTTER_ITEM_TYPES, readAngularJson, readPackageJson, TYPES_DEFAULT_FOLDER } from '@o3r/schematics';
import * as commentJson from 'comment-json';

const COMPONENT_SCHEMATICS_NAME = '@o3r/core:component';

/**
 * Update Otter environment variable for schematics
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.isDefaultGenerator
 * @param options.enableStorybook
 * @param options.enablePlaywright
 * @param options.enableStyling
 * @param options.enableAnalytics
 * @param _rootPath
 */
export function updateOtterEnvironmentAdapter(
  options: {
    projectName: string | null;
    isDefaultGenerator?: boolean;
    enableStorybook?: boolean;
    enableStyling?: boolean;
    enableAnalytics?: boolean;
  },
  _rootPath: string
): Rule {

  /**
   * Add Configuration for schematics
   *
   * @param tree
   * @param _context
   */
  const editAngularJson = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree);
    const packageJson = readPackageJson(tree, workspaceProject);
    const scope = packageJson.name!.split('/')[0];

    workspace.cli = workspace.cli || {};

    const componentSchematicsOptions = {
      ...(typeof options.enableStorybook !== 'undefined' ? { useStorybook: options.enableStorybook } : {}),
      ...(typeof options.enableStyling !== 'undefined' ? { useOtterTheming: options.enableStyling } : {}),
      ...(typeof options.enableAnalytics !== 'undefined' ? { useOtterAnalytics: options.enableAnalytics } : {})
    };

    if (!workspace.schematics) {
      workspace.schematics = {};
    }

    workspace.schematics[COMPONENT_SCHEMATICS_NAME] = {
      ...(workspace.schematics[COMPONENT_SCHEMATICS_NAME] || {} as any),
      ...componentSchematicsOptions
    };


    if (workspaceProject.projectType === 'application') {
      if (!workspaceProject.schematics) {
        workspaceProject.schematics = {};
      }

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].app;
        if (path) {
          workspaceProject.schematics![item] = {
            path,
            ...(workspaceProject.schematics![item] || {})
          };
        }
      });

      // force dist/ output folder for production build
      if (workspaceProject.architect && workspaceProject.architect.build) {
        workspaceProject.architect.build.configurations ||= {};
        workspaceProject.architect.build.configurations.production ||= {};
        workspaceProject.architect.build.configurations.production.outputPath ||= 'dist';

        if (workspaceProject.architect.build.configurations.options &&
            workspaceProject.architect.build.configurations.options.outputPath &&
            /^dist([/].+)?/i.test(workspaceProject.architect.build.configurations.options.outputPath)) {
          workspaceProject.architect.build.configurations.options.outputPath ||= 'dist-dev';
        }

      }

      workspace.projects[projectName] = workspaceProject;
    } else {
      workspace.cli.packageManager ||= getPackageManager() as PackageManager;

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].lib ? `modules/${scope}/${TYPES_DEFAULT_FOLDER[item].lib!}` : null;
        if (path) {
          workspace.schematics![item] = {
            path,
            ...(workspace.schematics![item] || {})
          };
        }
      });

    }
    if (options.isDefaultGenerator) {
      workspace.cli.defaultCollection = '@o3r/core';
    }
    workspace.cli.analytics = false;

    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  const editTsConfigJson = (tree: Tree) => {
    if (tree.exists('/tsconfig.json')) {
      const tsConfig: any = commentJson.parse(tree.read('/tsconfig.json')!.toString());
      if (tsConfig.compilerOptions?.noPropertyAccessFromIndexSignature) {
        delete tsConfig.compilerOptions.noPropertyAccessFromIndexSignature;
      }
      tree.overwrite('/tsconfig.json', commentJson.stringify(
        tsConfig,
        null,
        2
      ));
    }
    return tree;
  };

  /**
   * Use Angular CLI generator to create environment files
   *
   * @param tree
   * @param context
   */
  const generateEnvironmentFiles = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);
    if (workspaceProject.projectType !== 'application') {
      return tree;
    }
    if (tree.exists('/src/environments/environment.ts')) {
      return tree;
    }
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const envBasePath = 'src/environments';
    const envDevFilePath = `${envBasePath}/environment.development.ts`;
    if (!tree.exists(envDevFilePath)) {
      return chain([generateEnvironments({project: projectName})])(tree, context);
    }
    return tree;
  };

  /**
   * Update environment files to add `production` boolean
   *
   * @param tree
   * @param _context
   */
  const editEnvironmentFiles = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree);
    if (workspaceProject.projectType !== 'application') {
      return tree;
    }

    const envBasePath = 'src/environments';
    const envDevFilePath = `${envBasePath}/environment.development.ts`;

    if (!tree.exists(envDevFilePath)) {
      return tree;
    }

    const envDefaultFilePath = `${envBasePath}/environment.ts`;
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
