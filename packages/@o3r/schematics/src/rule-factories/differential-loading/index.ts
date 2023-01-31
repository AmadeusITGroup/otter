import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';
import { getDefaultProjectName, getProjectFromTree, readAngularJson } from '../../utility/loaders';

/**
 * Update configuration to set differential loading for applications
 *
 * @param options @see RuleFactory.options
 * @param options.projectName Project name
 */
export function updateDifferentialLoading(options?: { projectName: string | null }): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const tsconfigProdPath = 'tsconfig.prod.json';
    const workspaceProject = getProjectFromTree(tree, options?.projectName);
    const workspace = readAngularJson(tree);

    if (workspaceProject.projectType !== 'application') {
      context.logger.info('The project is not an application, the Differential Loading setup is skipped');
      return tree;
    }

    const tsConfigPath: string | undefined = workspaceProject.architect?.build?.options?.tsConfig;

    if (tsConfigPath && tree.exists(`/${tsConfigPath}`) && !tree.exists(`/${tsconfigProdPath}`)) {
      const tsconfig: any = commentJson.parse(tree.read(`/${tsConfigPath}`)!.toString());
      tsconfig.compilerOptions = tsconfig.compilerOptions || {};
      tsconfig.compilerOptions.target = tsconfig.compilerOptions.target || 'es2015';

      workspaceProject.architect!.build.configurations = workspaceProject.architect!.build.configurations || {};
      workspaceProject.architect!.build.configurations.production = workspaceProject.architect!.build.configurations.production || {};
      workspaceProject.architect!.build.configurations.production.tsConfig = tsconfigProdPath;

      const projectName = options?.projectName || getDefaultProjectName(tree);
      workspace.projects[projectName] = workspaceProject;
      tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
      tree.overwrite(`/${tsConfigPath}`, commentJson.stringify(tsconfig, null, 2));
      tree.create(`/${tsconfigProdPath}`, JSON.stringify({
        extends: `./${tsConfigPath}`,
        compilerOptions: {
          target: 'es2015'
        }
      }, null, 2));

      if (tree.exists('/ngsw-config.json')) {
        const ngsw: any = commentJson.parse(tree.read('/ngsw-config.json')!.toString());
        if (Array.isArray(ngsw.assetGroups)) {
          (ngsw.assetGroups as {resources?: {files?: string[]}}[])
            .filter((assetGroup) => assetGroup.resources && assetGroup.resources.files)
            .forEach((assetGroup) => {
              const excludeJsFiles = assetGroup.resources!.files!
                .filter((file) => file.endsWith('*.js') && !file.endsWith('es5*.js'))
                .map((file) => file.replace(/^(.*)\*\.js$/, '!$1*-es5*.js'));

              assetGroup.resources!.files!.push(...excludeJsFiles);
            });
        }
      } else {
        context.logger.warn('The ngsw-config.json file has not been found, you will need to modify it manually to exclude es5 files from pre-fetch configuration');
      }

    } else {
      context.logger.warn('The tsconfig.prod.json file has not been created');
    }

    return tree;
  };
}
