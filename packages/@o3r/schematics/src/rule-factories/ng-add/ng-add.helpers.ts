import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  externalSchematic,
  noop,
  Rule,
  Schematic,
  SchematicContext
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask
} from '@angular-devkit/schematics/tasks';
import {
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import {
  lastValueFrom
} from 'rxjs';
import type {
  PackageJson
} from 'type-fest';
import type {
  NgAddPackageOptions
} from '../../tasks/index';
import {
  getPackageManager
} from '../../utility/index';

const getNgAddSchema = (packageName: string, context: SchematicContext) => {
  try {
    const collection = context.engine.createCollection(packageName);
    return collection.createSchematic('ng-add');
  } catch {
    context.logger.warn(`No ng-add found for ${packageName}`);
    return undefined;
  }
};

const sortDependencies = (packageJson: PackageJson, depType: 'dependencies' | 'devDependencies' | 'peerDependencies') => {
  packageJson[depType] = packageJson[depType]
    ? Object.fromEntries(Object.entries(packageJson[depType] || {}).sort(([key1, _val1], [key2, _val2]) => key1.localeCompare(key2)))
    : undefined;
};

/**
 * Install via `ng add` a list of npm packages.
 * @param packages List of packages to be installed via `ng add`
 * @param options install options
 * @param packageJsonPath path of the package json of the project where they will be installed
 */
export function ngAddPackages(packages: string[], options?: Omit<NgAddPackageOptions, 'version'> & { version?: string | (string | undefined)[] }, packageJsonPath = '/package.json'): Rule {
  if (packages.length === 0) {
    return noop;
  }
  const cwd = process.cwd().replace(/[/\\]+/g, '/');
  // FileSystem working directory might be different from Tree working directory (when using `yarn workspace` for example)
  const fsWorkingDirectory = (options?.workingDirectory && !cwd.endsWith(options.workingDirectory)) ? options.workingDirectory : '.';
  const versions = Object.fromEntries(packages.map<[string, string | undefined]>((packageName, index) =>
    [packageName, typeof options?.version === 'object' ? options.version[index] : options?.version]));
  if (options?.workingDirectory && !packageJsonPath.startsWith(options.workingDirectory)) {
    packageJsonPath = path.join(options.workingDirectory, packageJsonPath);
  }

  const getInstalledVersion = (packageName: string) => {
    let versionFound: string | undefined;
    for (const workingDirectory of new Set([fsWorkingDirectory, '.'])) {
      try {
        const fileSystemPackageJson = JSON.parse(readFileSync(path.join(workingDirectory, 'package.json'), { encoding: 'utf8' }));
        let version: string | undefined;
        if (options?.dependencyType === NodeDependencyType.Dev) {
          version = fileSystemPackageJson.devDependencies[packageName];
        } else if (options?.dependencyType === NodeDependencyType.Peer) {
          version = fileSystemPackageJson.peerDependencies[packageName];
        } else {
          version = fileSystemPackageJson.dependencies[packageName];
        }
        if (versionFound && version !== versionFound) {
          // In case of conflict between package.json files, we consider the package as not installed to force its update
          return;
        }
        versionFound = version;
      } catch {
        return;
      }
    }
    return versionFound;
  };

  const getOptions = (schema: Schematic<any, any>) => {
    const schemaOptions = schema.description.schemaJson?.properties || {};
    return Object.entries(options || {}).reduce<Record<string, any>>((accOptions, [key, value]: [string, any]) => {
      if (schemaOptions[key]) {
        accOptions[key] = value;
      }
      return accOptions;
    }, {});
  };

  const installedVersions = packages.map((packageName) => getInstalledVersion(packageName));
  const packageManager = getPackageManager();
  const packagesToInstall = packages.filter((packageName, index) => !installedVersions[index] || installedVersions[index] !== versions[packageName]);
  if (packagesToInstall.length === 0) {
    return noop;
  }
  return chain([
    // Update package.json in tree
    (tree) => {
      for (const filePath of new Set([packageJsonPath, './package.json'])) {
        const packageJson: PackageJson = tree.readJson(filePath) as PackageJson;
        packages.forEach((packageName) => {
          const version = versions[packageName] || 'latest';
          if (options?.dependencyType === NodeDependencyType.Dev) {
            packageJson.devDependencies = { ...packageJson.devDependencies, [packageName]: version };
          } else if (options?.dependencyType === NodeDependencyType.Peer) {
            packageJson.peerDependencies = { ...packageJson.peerDependencies, [packageName]: version };
          } else {
            packageJson.dependencies = { ...packageJson.dependencies, [packageName]: version };
          }
        });
        (['dependencies', 'devDependencies', 'peerDependencies'] as const).forEach((depType) => {
          sortDependencies(packageJson, depType);
        });
        tree.overwrite(filePath, JSON.stringify(packageJson, null, 2));
      }
    },
    // Run ng-adds
    async (tree, context) => {
      if (options?.skipNgAddSchematicRun) {
        context.logger.info(`Package(s) '${packagesToInstall.join(', ')}' was(were) installed.
      The run of 'ng-add' schematics for the package(s) is intentionally skipped. You can do the run standalone, later.`);
        return noop;
      }

      new Set([packageJsonPath, './package.json']).forEach((filePath) => {
        mkdirSync(path.join(process.cwd(), path.dirname(filePath)), { recursive: true });
        writeFileSync(path.join(process.cwd(), filePath), tree.readText(filePath));
      });
      context.addTask(new NodePackageInstallTask({
        packageManager: packageManager,
        hideOutput: false,
        quiet: false
      } as any));
      await lastValueFrom(context.engine.executePostTasks());

      const ngAddsToApply = packagesToInstall
        .map((packageName) => ({ packageName, ngAddCollection: getNgAddSchema(packageName, context) }))
        .filter(({ packageName, ngAddCollection }) => {
          if (!ngAddCollection) {
            context.logger.info(
              `No ng-add schematic found for: '${packageName}'. Skipping ng add for: ${packageName}${versions[packageName] ? ' with version: ' + versions[packageName] : ''}`);
          }
          return !!ngAddCollection;
        })
        .map(({ packageName, ngAddCollection }) => externalSchematic(packageName, 'ng-add', getOptions(ngAddCollection!)));
      return chain(ngAddsToApply);
    }
  ]);
}
