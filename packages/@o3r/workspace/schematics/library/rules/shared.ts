import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  enforceTildeRange,
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
 * @param o3rCorePackageJson Content of core's package.json
 * @param options Option of the schematic
 */
export function updatePackageDependenciesFactory(
    targetPath: string,
    otterVersion: string,
    o3rCorePackageJson: PackageJson & { generatorDependencies?: Record<string, string> },
    options: NgGenerateModuleSchema & { useJest?: boolean }): Rule {
  return (tree) => {
    const packageJson = tree.readJson(path.posix.join(targetPath, 'package.json')) as PackageJson;
    const runner = getPackageManagerRunner(getWorkspaceConfig(tree));
    packageJson.description = options.description || packageJson.description;
    packageJson.scripts ||= {};
    packageJson.scripts.build = `${runner} ng build ${options.name}`;
    packageJson.scripts['prepare:build:builders'] = `${runner} cpy 'collection.json' dist && ${runner} cpy 'schematics/**/*.json' dist/schematics`;
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
        '@angular-devkit/build-angular': o3rCorePackageJson.peerDependencies!['@angular-devkit/core'],
        '@angular-devkit/core': o3rCorePackageJson.peerDependencies!['@angular-devkit/core'],
        '@angular-eslint/eslint-plugin': o3rCorePackageJson.generatorDependencies!['@angular-eslint/eslint-plugin'],
        '@angular/cli': packageJson.peerDependencies['@angular/common'],
        '@angular/common': packageJson.peerDependencies['@angular/common'],
        '@angular/compiler': packageJson.peerDependencies['@angular/common'],
        '@angular/compiler-cli': packageJson.peerDependencies['@angular/common'],
        '@angular/core': packageJson.peerDependencies['@angular/common'],
        '@angular/platform-browser': packageJson.peerDependencies['@angular/common'],
        '@angular/platform-browser-dynamic': packageJson.peerDependencies['@angular/common'],
        '@schematics/angular': o3rCorePackageJson.peerDependencies!['@schematics/angular'],
        'cpy-cli': o3rCorePackageJson.generatorDependencies!['cpy-cli'],
        ...options.useJest
          ? {
            '@angular-builders/jest': o3rCorePackageJson.generatorDependencies!['@angular-builders/jest'],
            '@angular-devkit/build-angular': o3rCorePackageJson.devDependencies!['@angular-devkit/build-angular'],
            '@types/jest': o3rCorePackageJson.devDependencies!['@types/jest'],
            jest: o3rCorePackageJson.devDependencies!.jest,
            'jest-environment-jsdom': o3rCorePackageJson.devDependencies!.jest,
            'jest-junit': o3rCorePackageJson.devDependencies!['jest-junit'],
            'jest-preset-angular': o3rCorePackageJson.devDependencies!['jest-preset-angular'],
            'ts-jest': o3rCorePackageJson.devDependencies!['ts-jest']
          }
          : {},
        rxjs: o3rCorePackageJson.peerDependencies!.rxjs,
        typescript: o3rCorePackageJson.peerDependencies!.typescript,
        'zone.js': o3rCorePackageJson.generatorDependencies!['zone.js']
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
    tree.overwrite(path.posix.join(targetPath, 'ng-package.json'), JSON.stringify(ngPackagr, null, 2));
    return tree;
  };
}
