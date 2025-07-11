import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  PackageJson,
} from 'type-fest';
import {
  mapMigrationFromCoreImports,
} from './migration/import-map';
import type {
  NgAddSchematicsSchema,
} from './schema';

const devDependenciesToInstall: string[] = [

];
const dependenciesToInstall: string[] = [

];

const reportMissingSchematicsDep = (logger: { error: (message: string) => any }) => (reason: any) => {
  logger.error(`[ERROR]: Adding @ama-sdk/client-fetch has failed.
If the error is related to missing @o3r dependencies you need to install '@o3r/schematics' as devDependency to be able to use this schematics. Please run 'ng add @o3r/schematics'.
Otherwise, use the error message as guidance.`);
  throw reason;
};

/**
 * Add SDk Fetch Client to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return async (tree, context) => {
    // use dynamic import to properly raise an exception if it is not an Otter project.
    const {
      getPackageInstallConfig,
      applyEsLintFix,
      setupDependencies,
      getO3rPeerDeps,
      getProjectNewDependenciesTypes,
      getWorkspaceConfig,
      getExternalDependenciesInfo,
      updateImports
    } = await import('@o3r/schematics');

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);
    const projectPackageJson = tree.readJson(path.posix.join(workspaceProject?.root || '.', 'package.json')) as PackageJson;

    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));
    const externalDependenciesInfo = getExternalDependenciesInfo(
      {
        devDependenciesToInstall,
        dependenciesToInstall,
        o3rPackageJsonPath: packageJsonPath,
        projectPackageJson,
        projectType: workspaceProject?.projectType
      },
      context.logger
    );

    return chain([
      // optional custom action dedicated to this module
      options.skipLinter ? noop() : applyEsLintFix(),
      // add the missing Otter modules in the current project
      setupDependencies({
        projectName: options.projectName,
        dependencies: {
          ...dependencies,
          ...externalDependenciesInfo
        },
        ngAddToRun: depsInfo.o3rPeerDeps
      }),

      updateImports(mapMigrationFromCoreImports)
    ]);
  };
}

/**
 * Add SDk Fetch Client to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(reportMissingSchematicsDep(logger));
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};
