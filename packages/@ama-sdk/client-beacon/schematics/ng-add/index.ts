import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getExternalDependenciesInfo,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
  updateImports,
} from '@o3r/schematics';
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

/**
 * Add SDk Beacon Client to an Otter Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree, context) => {
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
 * Add SDk Beacon Client to an Otter Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
