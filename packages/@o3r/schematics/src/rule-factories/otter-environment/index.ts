import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PackageManager } from '@angular/cli/lib/config/workspace-schema';
import * as commentJson from 'comment-json';
import { OTTER_ITEM_TYPES, TYPES_DEFAULT_FOLDER } from '../../utility/generation';
import { getProjectFromTree, readAngularJson, readPackageJson } from '../../utility/loaders';

/**
 * Update Otter environment variable for schematics
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.isDefaultGenerator
 * @param options.enableStorybook
 * @param options.enablePlaywright
 * @param _rootPath
 */
export function updateOtterEnvironmentAdapter(options: { projectName: string | null; isDefaultGenerator?: boolean; enableStorybook?: boolean }, _rootPath: string): Rule {

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

    if (!workspace.schematics) {
      workspace.schematics = {};
    }

    if (typeof options.enableStorybook !== 'undefined') {
      workspace.schematics['@otter/ng-tools:component'] = {
        ...(workspace.schematics['@otter/ng-tools:component'] || {} as any),
        useStorybook: options.enableStorybook
      };
    }

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
        workspaceProject.architect.build.configurations = workspaceProject.architect.build.configurations || {};
        workspaceProject.architect.build.configurations.production = workspaceProject.architect.build.configurations.production || {};
        workspaceProject.architect.build.configurations.production.outputPath = 'dist';
        if (workspaceProject.architect.build.configurations.options &&
            workspaceProject.architect.build.configurations.options.outputPath &&
            /^dist([/].+)?/i.test(workspaceProject.architect.build.configurations.options.outputPath)) {
          workspaceProject.architect.build.configurations.options.outputPath = 'dist-dev';
        }
      }

      workspace.projects[projectName] = workspaceProject;
    } else {
      workspace.cli.packageManager = PackageManager.Yarn;

      OTTER_ITEM_TYPES.forEach((item) => {
        const path = TYPES_DEFAULT_FOLDER[item].lib ? `modules/${scope }/${TYPES_DEFAULT_FOLDER[item].lib!}` : null;
        if (path) {
          workspace.schematics![item] = {
            path,
            ...(workspace.schematics![item] || {})
          };
        }
      });

    }
    if (options.isDefaultGenerator) {
      workspace.cli.defaultCollection = '@otter/ng-tools';
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

  return chain([
    editAngularJson,
    editTsConfigJson
  ]);
}
