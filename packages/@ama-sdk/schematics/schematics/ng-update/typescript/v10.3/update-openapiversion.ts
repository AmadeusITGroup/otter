import type {
  Rule
} from '@angular-devkit/schematics';
import {
  chain
} from '@angular-devkit/schematics';
import {
  getWorkspaceConfig,
  globInTree
} from '@o3r/schematics';
import * as semver from 'semver';

/**
 * Update open api version used in the project to match with the one used in @ama-sdk/schematics:typescript-core
 */
export const updateOpenApiVersionInProject = (): Rule => {
  const overwriteOpenApiVersion = (pathOfWorkspace: string): Rule => {
    return (tree, context) => {
      const packageJson = tree.readText(`${pathOfWorkspace}/package.json`);
      const amaSdkTypescriptUsage = packageJson.match(/@ama-sdk\/schematics:typescript-core.*",?$/gm);
      if (!amaSdkTypescriptUsage) {
        context.logger.info(`Skipping ng-update for ${pathOfWorkspace} as it does not use @ama-sdk/schematics:typescript-core`);
        return tree;
      }
      const openapitoolsPaths: string[] = [];
      amaSdkTypescriptUsage.forEach((script) => {
        const openapiToolsPath = new RegExp(/@ama-sdk\/schematics:typescript-core.* --spec-config-path(?:=|\s+)["']?(?:\.\/)?([\w./-]*\.json)/).exec(script);
        if (openapiToolsPath?.length === 2) {
          openapitoolsPaths.push(`${pathOfWorkspace}/${openapiToolsPath[1]}`);
        }
      });
      if (amaSdkTypescriptUsage.length > openapitoolsPaths.length) {
        openapitoolsPaths.push(`${pathOfWorkspace}/openapitools.json`);
      }
      (openapitoolsPaths || []).forEach((path) => {
        if (!tree.exists(path)) {
          context.logger.warn(`Missing ${path} file described in the package json.`);
          return;
        }
        const openApiToolsConfig = tree.readJson(path) as any;
        openApiToolsConfig['generator-cli'] ||= {};
        if (!openApiToolsConfig['generator-cli'].version || !semver.satisfies(openApiToolsConfig['generator-cli'].version, '~7.4.0')) {
          context.logger.info(`The following file will be updated to target open api tools version 7.4: ${path}`);
          openApiToolsConfig['generator-cli'].version = '7.4.0';
          tree.overwrite(path, JSON.stringify(openApiToolsConfig, null, 2));
        }
      }
      );
      return tree;
    };
  };

  return (tree, context) => {
    const pathsPackageJson = ['.'];
    if (!tree.exists('package.json')) {
      context.logger.error('Could not find a package.json file, make sure to run the ng-update at the root of typescript project');
    }
    const cwdPackageJson = tree.readJson('package.json') as any;
    if (tree.exists('angular.json')) {
      const workspaceConfig = getWorkspaceConfig(tree);
      pathsPackageJson.push(...Object.values(workspaceConfig?.projects || {}).map((project) => project.root));
    } else if (cwdPackageJson.workspaces) {
      context.logger.info('Workspaces detected outside an angular project, running the update on the workspaces');
      pathsPackageJson.push(...cwdPackageJson.workspaces.reduce((paths: string[], workspace: string) => {
        if (workspace.includes('*')) {
          paths.push(
            ...globInTree(tree, [`**/${workspace}/package.json`]).map((path) => path.replace('/package.json', ''))
          );
        } else {
          paths.push(workspace);
        }
        return paths;
      }, []));
    }
    return chain(
      pathsPackageJson.map((pathPackageJson) =>
        overwriteOpenApiVersion(pathPackageJson.at(-1) === '/' ? pathPackageJson.trim() : pathPackageJson)
      )
    );
  };
};
