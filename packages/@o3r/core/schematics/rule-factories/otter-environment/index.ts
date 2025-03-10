import {
  posix,
} from 'node:path';
import type {
  PackageManager,
} from '@angular/cli/lib/config/workspace-schema';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  getPackageManager,
  getWorkspaceConfig,
  OTTER_ITEM_TYPES,
  registerCollectionSchematics,
  TYPES_DEFAULT_FOLDER,
} from '@o3r/schematics';
import generateEnvironments from '@schematics/angular/environments/index';
import type {
  TsConfigJson,
} from 'type-fest';
import * as ts from 'typescript';

const editTsConfigJson = (tree: Tree) => {
  const tsConfigPath = '/tsconfig.json';
  if (tree.exists(tsConfigPath)) {
    const tsConfig = ts.parseConfigFileTextToJson(tsConfigPath, tree.readText(tsConfigPath)).config as TsConfigJson;
    if (tsConfig.compilerOptions) {
      if (tsConfig.compilerOptions.noPropertyAccessFromIndexSignature) {
        delete tsConfig.compilerOptions.noPropertyAccessFromIndexSignature;
      }
      tsConfig.compilerOptions.moduleResolution = 'node';
      tsConfig.compilerOptions.declaration = true;
    }
    tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  }
  return tree;
};

/**
 * Update Otter environment variable for schematics
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param options.enableStyling
 * @param options.enableAnalytics
 * @param options.workingDirectory
 * @param _rootPath @see RuleFactory.rootPath
 */
export function updateOtterEnvironmentAdapter(
  options: {
    projectName?: string | null | undefined;
    enableStyling?: boolean;
    enableAnalytics?: boolean;
    workingDirectory?: string | null;
  },
  _rootPath: string
): Rule {
  /**
   * Add Configuration for schematics
   * @param tree
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;
    if (!workspace || !workspaceProject) {
      context.logger.error('No application detected, the Otter environment will not be setup');
      return tree;
    }

    workspace.cli = workspace.cli || {};
    workspaceProject.schematics ||= {};

    if (workspaceProject.projectType === 'application') {
      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].app;
        if (path) {
          workspaceProject.schematics![item] = {
            path: posix.join(workspaceProject.root, path),
            ...workspaceProject.schematics![item]
          };
        }
      });

      // override angular's dist/webapp output path with apps/webapp/dist
      if (workspaceProject.architect?.build?.options?.outputPath) {
        workspaceProject.architect.build.options.outputPath = posix.join(workspaceProject.root, 'dist');
      }

      workspace.projects[options.projectName!] = workspaceProject;
    } else {
      workspace.cli.packageManager ||= getPackageManager() as PackageManager;

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].lib;
        if (path) {
          workspaceProject.schematics![item] = {
            path: posix.join(workspaceProject.root, path),
            ...workspaceProject.schematics![item]
          };
        }
      });
    }
    registerCollectionSchematics(workspace, '@o3r/core');
    workspace.cli.analytics = false;

    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
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
      return generateEnvironments({ project: projectName })(tree, context);
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
      if (!/production["']?:\s*(true|false)/.test(envContent)) {
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
