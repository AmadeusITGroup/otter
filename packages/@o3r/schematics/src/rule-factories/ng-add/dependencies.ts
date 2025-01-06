import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  Schematic,
  type SchematicContext,
  type TaskId,
  Tree,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import * as semver from 'semver';
import type {
  PackageJson,
} from 'type-fest';
import type {
  SupportedPackageManagers,
} from '../../utility';
import {
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
} from '../../utility/loaders';
import {
  getPackageManager,
} from '../../utility/package-manager-runner';

/**
 * Options to be passed to the ng add task
 */
export interface NgAddSchematicOptions {
  /** Name of the project */
  projectName?: string | null;

  /** Skip the run of the linter*/
  skipLinter?: boolean;

  /** Skip the install process */
  skipInstall?: boolean;

  [x: string]: any;
}

export interface DependencyInManifest {
  /**
   * Range of the dependency
   * @default 'latest'
   */
  range?: string;
  /**
   * Types of the dependency
   * @default [NodeDependencyType.Default]
   */
  types?: NodeDependencyType[];
}

export interface DependencyToAdd {
  /** Enforce this dependency to be applied to Workspace's manifest only */
  toWorkspaceOnly?: boolean;
  /** List of dependency to register in manifest */
  inManifest: DependencyInManifest[];
  /** ng-add schematic option dedicated to the package */
  ngAddOptions?: NgAddSchematicOptions;
  /** Determine if the dependency require to be installed */
  requireInstall?: boolean;
  /**
   * Enforce the usage of tilde instead of caret in a dependency range
   * If not specified, the context option value will be used
   */
  enforceTildeRange?: boolean;
}

export interface SetupDependenciesOptions {
  /** Map of dependencies to install */
  dependencies: Record<string, DependencyToAdd>;
  /**
   * Pattern of list of the dependency for which the ng-add run process is required
   */
  ngAddToRun?: (RegExp | string)[];
  /**
   * Will skip install in the end of the package.json update.
   * if `undefined`, the installation will be process only if a ngAdd run is required.
   * If `true` the install will not run in any case
   * @default undefined
   */
  skipInstall?: boolean;
  /** Project Name */
  projectName?: string;
  /** default ng-add schematic option */
  ngAddOptions?: NgAddSchematicOptions;
  /** Enforce install package manager */
  packageManager?: SupportedPackageManagers;
  /** Task will run after the given task ID (if specified) */
  runAfterTasks?: TaskId[];
  /** Callback to run after the task ID is calculated */
  scheduleTaskCallback?: (taskIds?: TaskId[]) => void;
  /** Working directory for the installation process only */
  workingDirectory?: string;
  /**
   * Enforce the usage of tilde instead of caret in a dependency range
   * @default true
   */
  enforceTildeRange?: boolean;
}

/** Result of the Setup Dependencies task scheduling process */
export interface SetupDependenciesResult {
  /** List of the task ID resulting of the install process */
  taskIds: TaskId[];
}

/**
 * Determine if the context has information regarding the setup dependencies process
 * @param context Schematic context
 */
export const hasSetupInformation = (context: SchematicContext): context is SchematicContext & { setupDependencies: SetupDependenciesResult } => {
  return !!(context as any).setupDependencies;
};

/**
 * Retrieve the package install configuration
 * This is a workaround to ng-add to add the dependency to the sub-package
 * @param packageJsonPath Path to the module package.json file
 * @param tree Tree to read the file
 * @param projectName Name of the project
 * @param devDependencyOnly If true, the dependency will be added as devDependency
 * @param exactO3rVersion Use a pinned version of the o3r package
 */
export const getPackageInstallConfig = (packageJsonPath: string, tree: Tree, projectName?: string, devDependencyOnly?: boolean, exactO3rVersion?: boolean): Record<string, DependencyToAdd> => {
  if (!projectName) {
    return {};
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
  const workspaceProject = projectName ? getWorkspaceConfig(tree)?.projects[projectName] : undefined;
  return {
    [packageJson.name!]: {
      inManifest: [{
        range: `${exactO3rVersion ? '' : '~'}${packageJson.version}`,
        types: devDependencyOnly ? [NodeDependencyType.Dev] : getProjectNewDependenciesTypes(workspaceProject)
      }],
      requireInstall: true,
      ngAddOptions: { exactO3rVersion: exactO3rVersion }
    }
  };
};

/**
 * Replace the caret ranges by tilde ranges
 * @param range Range to replace
 */
export const enforceTildeRange = (range?: string) => {
  return range?.replace(/\^/g, '~');
};

/**
 * Setup dependency to a repository.
 * Will run manually the ngAdd schematics according to the parameters and install the packages if required
 * @param options
 */
export const setupDependencies = (options: SetupDependenciesOptions): Rule => {
  return () => {
    const ngAddToRun = new Set(Object.keys(options.dependencies)
      .filter((dep) => options.ngAddToRun?.some((pattern) => typeof pattern === 'string' ? pattern === dep : pattern.test(dep))));
    const requiringInstallList = new Set(Object.entries(options.dependencies).filter(([, { requireInstall }]) => requireInstall).map(([dep]) => dep));
    const isInstallNeeded = () => options.skipInstall === undefined ? (ngAddToRun.size > 0 || requiringInstallList.size > 0) : !options.skipInstall;

    const editPackageJson = (packageJsonPath: string, packageToInstall: string, dependency: DependencyToAdd, updateLists: boolean): Rule => {
      return (tree, context) => {
        if (!tree.exists(packageJsonPath)) {
          context.logger.warn(`The file ${packageJsonPath} does not exist, the dependency ${packageToInstall} will not be added`);
          return tree;
        }
        const packageJsonContent = tree.readJson(packageJsonPath) as PackageJson;

        dependency.inManifest.forEach(({ range, types }) => {
          const isTildeRangeEnforced = dependency.enforceTildeRange === undefined ? (options.enforceTildeRange === undefined || options.enforceTildeRange) : dependency.enforceTildeRange;
          if (isTildeRangeEnforced) {
            range = enforceTildeRange(range);
          }
          (types || [NodeDependencyType.Default]).forEach((depType) => {
            if (packageJsonContent[depType]?.[packageToInstall]) {
              if (range && semver.validRange(range)) {
                const currentMinimalVersion = semver.minVersion(packageJsonContent[depType]?.[packageToInstall]);
                const myRangeMinimalVersion = semver.minVersion(range);
                if (currentMinimalVersion && myRangeMinimalVersion && semver.gt(myRangeMinimalVersion, currentMinimalVersion)) {
                  context.logger.debug(`The dependency ${packageToInstall} (${depType}@${range}) will be added in ${packageJsonPath}`);
                  packageJsonContent[depType][packageToInstall] = range;
                } else {
                  if (updateLists) {
                    ngAddToRun.delete(packageToInstall);
                    requiringInstallList.delete(packageToInstall);
                  }
                  context.logger.debug(`The dependency ${packageToInstall} (${depType}) is already in ${packageJsonPath}, it will not be added.`);
                  context.logger.debug(`Because its range is inferior or included to the current one (${range} < ${packageJsonContent[depType][packageToInstall]}) in targeted ${packageJsonPath}`);
                }
              } else {
                if (updateLists) {
                  ngAddToRun.delete(packageToInstall);
                  requiringInstallList.delete(packageToInstall);
                }
                context.logger.warn(`The dependency ${packageToInstall} (${depType}) will not added `
                + `because there is already this dependency with a defined range (${packageJsonContent[depType][packageToInstall]}) in targeted ${packageJsonPath}`);
              }
            } else {
              packageJsonContent[depType] ||= {};
              packageJsonContent[depType][packageToInstall] = range;
              context.logger.debug(`The dependency ${packageToInstall} (${depType}@${range}) will be added in ${packageJsonPath}`);
            }
            packageJsonContent[depType] = Object.keys(packageJsonContent[depType])
              .sort()
              .reduce((acc, key) => {
                acc[key] = packageJsonContent[depType]![key];
                return acc;
              }, {} as PackageJson.Dependency);
          });
        });

        const content = JSON.stringify(packageJsonContent, null, 2);
        tree.overwrite(packageJsonPath, content);
        return tree;
      };
    };

    const addDependencies: Rule = (tree) => {
      const workspaceConfig = getWorkspaceConfig(tree);
      const workspaceProject = (options.projectName && workspaceConfig?.projects?.[options.projectName]) || undefined;
      const projectDirectory = workspaceProject?.root;
      return chain(Object.entries(options.dependencies)
        .map(([packageName, dependencyDetails]) => {
          const shouldRunInSubPackage = projectDirectory && !dependencyDetails.toWorkspaceOnly;
          const rootPackageRule = editPackageJson('package.json', packageName, dependencyDetails, !shouldRunInSubPackage);
          if (shouldRunInSubPackage) {
            return chain([
              rootPackageRule,
              editPackageJson(path.posix.join(projectDirectory, 'package.json'), packageName, dependencyDetails, true)
            ]);
          }
          return rootPackageRule;
        })
      );
    };

    const runNgAddSchematics: Rule = (_, context) => {
      const packageManager = options.packageManager || getPackageManager();
      const installId = isInstallNeeded()
        ? [
          context.addTask(new NodePackageInstallTask({ packageManager, quiet: true, workingDirectory: options.workingDirectory }), options.runAfterTasks)
        ]
        : undefined;

      if (installId !== undefined) {
        context.logger.debug(`Schedule the installation of the workspace (${ngAddToRun.size > 0 ? 'for: ' + [...ngAddToRun].join(', ') : (options.skipInstall ? 'skipped' : 'forced')})`);
      }

      const getOptions = (packageName: string, schema?: Schematic<any, any>) => {
        const schemaOptions = schema?.description.schemaJson?.properties;
        return Object.fromEntries(
          Object.entries({ projectName: options.projectName, ...options.ngAddOptions, ...options.dependencies[packageName].ngAddOptions })
            .filter(([key]) => !schemaOptions || !!schemaOptions[key])
        );
      };

      const finalTaskIds = [...ngAddToRun]
        .map((packageName) => {
          let schematic: Schematic<any, any> | undefined;
          try {
            const collection = context.engine.createCollection(packageName);
            schematic = collection.createSchematic('ng-add');
          } catch (e: any) {
            context.logger.warn(`The package ${packageName} was not installed, the options check will be skipped`, e);
          }
          const schematicOptions = getOptions(packageName, schematic);
          return { packageName, schematicOptions };
        })
        .reduce((ids, { packageName, schematicOptions }) => {
          context.logger.debug(`Schedule the schematic ng-add for ${packageName}`);
          return [...ids, context.addTask(new RunSchematicTask(packageName, 'ng-add', schematicOptions), ids)];
        }, [...(installId || []), ...(options.runAfterTasks || [])]);

      if (hasSetupInformation(context)) {
        context.setupDependencies.taskIds.push(...finalTaskIds);
      } else {
        (context as any).setupDependencies = { taskIds: finalTaskIds };
      }

      if (options.scheduleTaskCallback) {
        options.scheduleTaskCallback(finalTaskIds);
      }
    };

    return chain([
      addDependencies,
      runNgAddSchematics
    ]);
  };
};
