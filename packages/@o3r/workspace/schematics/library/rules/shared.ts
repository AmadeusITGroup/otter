import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  enforceTildeRange,
  getPackageManagerExecutor,
  getPackageManagerRunner,
  getWorkspaceConfig,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  NgGenerateModuleSchema,
} from '../schema';

/**
 * Generate rule to update generated package.json file
 * @param targetPath Path of the generated files
 * @param otterVersion Current version of otter
 * @param o3rWorkspacePackageJson Content of `@o3r/workspace` package.json
 * @param options Option of the schematic
 */
export function updatePackageDependenciesFactory(
    targetPath: string,
    otterVersion: string,
    o3rWorkspacePackageJson: PackageJson & { generatorDependencies?: Record<string, string> },
    options: NgGenerateModuleSchema & { useJest?: boolean; useVitest?: boolean }): Rule {
  return (tree) => {
    const packageJson = tree.readJson(path.posix.join(targetPath, 'package.json')) as PackageJson;
    const runner = getPackageManagerRunner(getWorkspaceConfig(tree));
    const executor = getPackageManagerExecutor(getWorkspaceConfig(tree));
    packageJson.description = options.description || packageJson.description;
    packageJson.scripts ||= {};
    packageJson.scripts.build = `${runner} ng build ${options.name}`;
    packageJson.scripts['prepare:build:builders'] = `${executor} cpy collection.json dist && ${executor} cpy 'schematics/**/*.json' dist/schematics`;
    packageJson.scripts['build:builders'] = 'tsc -b tsconfig.builders.json --pretty';
    packageJson.peerDependencies ||= {};
    packageJson.peerDependencies['@o3r/core'] = otterVersion;
    packageJson.peerDependencies['@o3r/schematics'] = otterVersion;
    packageJson.devDependencies ||= {};
    packageJson.keywords ||= [];
    packageJson.keywords.push('otter-module');
    packageJson.version = '0.0.0-placeholder';
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...Object.fromEntries(Object.entries({
        '@angular-devkit/build-angular': o3rWorkspacePackageJson.generatorDependencies!['@angular-devkit/build-angular'],
        '@angular-devkit/core': o3rWorkspacePackageJson.generatorDependencies!['@angular-devkit/core'],
        '@angular-eslint/eslint-plugin': o3rWorkspacePackageJson.generatorDependencies!['@angular-eslint/eslint-plugin'],
        '@angular/cli': packageJson.peerDependencies['@angular/common'],
        '@angular/common': packageJson.peerDependencies['@angular/common'],
        '@angular/compiler': packageJson.peerDependencies['@angular/common'],
        '@angular/compiler-cli': packageJson.peerDependencies['@angular/common'],
        '@angular/core': packageJson.peerDependencies['@angular/common'],
        '@angular/platform-browser': packageJson.peerDependencies['@angular/common'],
        '@angular/platform-browser-dynamic': packageJson.peerDependencies['@angular/common'],
        '@schematics/angular': o3rWorkspacePackageJson.generatorDependencies!['@schematics/angular'],
        'cpy-cli': o3rWorkspacePackageJson.generatorDependencies!['cpy-cli'],
        '@types/node': o3rWorkspacePackageJson.generatorDependencies!['@types/node'],
        ...options.useJest
          ? {
            '@angular-builders/jest': o3rWorkspacePackageJson.generatorDependencies!['@angular-builders/jest'],
            '@types/jest': o3rWorkspacePackageJson.generatorDependencies!['@types/jest'] || o3rWorkspacePackageJson.devDependencies!['@types/jest'],
            jest: o3rWorkspacePackageJson.generatorDependencies!.jest || o3rWorkspacePackageJson.devDependencies!.jest,
            'jest-environment-jsdom': o3rWorkspacePackageJson.generatorDependencies!['jest-environment-jsdom']
              || o3rWorkspacePackageJson.generatorDependencies!.jest || o3rWorkspacePackageJson.devDependencies!.jest,
            'jest-junit': o3rWorkspacePackageJson.generatorDependencies!['jest-junit']
              || o3rWorkspacePackageJson.devDependencies!['jest-junit'],
            'jest-preset-angular': o3rWorkspacePackageJson.generatorDependencies!['jest-preset-angular']
              || o3rWorkspacePackageJson.devDependencies!['jest-preset-angular'],
            'ts-jest': o3rWorkspacePackageJson.generatorDependencies!['ts-jest']
              || o3rWorkspacePackageJson.devDependencies!['ts-jest']
          }
          : (options.useVitest
            ? {
              jsdom: o3rWorkspacePackageJson.generatorDependencies!.jsdom || o3rWorkspacePackageJson.devDependencies!.jsdom,
              vitest: o3rWorkspacePackageJson.generatorDependencies!.vitest
            }
            : {
              '@types/jasmine': o3rWorkspacePackageJson.generatorDependencies!['@types/jasmine']
            }),
        rxjs: o3rWorkspacePackageJson.peerDependencies!.rxjs,
        typescript: o3rWorkspacePackageJson.peerDependencies!.typescript,
        'zone.js': o3rWorkspacePackageJson.generatorDependencies!['zone.js']
      }).map(([key, range]) => ([key, enforceTildeRange(range)])))
    };
    tree.overwrite(path.posix.join(targetPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    return tree;
  };
}

/**
 * Generate rule to update generated ng-packagr.json file
 * @param targetPath Path of the generated files
 */
export function updateNgPackagrFactory(targetPath: string): Rule {
  return (tree) => {
    const ngPackagr = tree.readJson(path.posix.join(targetPath, 'ng-package.json')) as any;
    ngPackagr.$schema = 'https://raw.githubusercontent.com/ng-packagr/ng-packagr/master/src/ng-package.schema.json';
    ngPackagr.dest = './dist';
    ngPackagr.allowedNonPeerDependencies ||= [];
    const schematicDependency = '@o3r/schematics';
    if (!ngPackagr.allowedNonPeerDependencies.includes(schematicDependency)) {
      ngPackagr.allowedNonPeerDependencies.push(schematicDependency);
    }
    tree.overwrite(path.posix.join(targetPath, 'ng-package.json'), JSON.stringify(ngPackagr, null, 2));
    return tree;
  };
}
