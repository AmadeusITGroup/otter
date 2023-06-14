/* eslint-disable @typescript-eslint/naming-convention */
import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, schematic, template, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { applyEsLintFix, findConfigFileRelativePath, isNxContext, readAngularJson, writeAngularJson } from '@o3r/schematics';
import { NgGenerateModuleSchema } from './schema';
import { readFileSync } from 'node:fs';
import type { PackageJson, TsConfigJson } from 'type-fest';

/**
 * Add an Otter compatible module to a monorepo
 *
 * @param options
 * @param rootPath
 */
export function ngGenerateModule(options: NgGenerateModuleSchema): Rule {

  /** Path to the folder where generate the new module */
  const targetPath = path.posix.resolve('/', options.path || 'packages', options.name);
  /** Name of the Nx Project in case of Nx monorepo */
  const projectName = options.projectName || options.name.replace(/^@/, '').replace('/', '-');

  /**
   * Register package in angular.json
   *
   * @param tree File tree
   * @param context Context of the schematics
   */
  const registerAngularActions: Rule = (tree, context) => {
    try {
      const angularJson = readAngularJson(tree);
      angularJson.projects ||= {};
      angularJson.projects[projectName] = {
        prefix: '',
        root: path.posix.join('.', targetPath),
        sourceRoot: path.posix.join('.', targetPath, 'src'),
        projectType: 'library',
        architect: {
          build: {
            builder: '@angular-devkit/build-angular:ng-packagr',
            options: {
              project: path.posix.join('.', targetPath, 'ng-package.json'),
              tsConfig: path.posix.join('.', targetPath, 'tsconfig.build.json')
            }
          }
        }
      };

      return writeAngularJson(tree, angularJson);
    } catch {
      context.logger.warn('The angular.json file has not be found, the new module will not registered');
    }

    return tree;
  };

  /**
   * Apply additional configurations in case of Nx monorepo
   *
   * @param tree File tree
   * @param context Context of the schematics
   */
  const registerNxActions: Rule = (tree, context) => {
    if (!isNxContext(tree)) {
      context.logger.debug('Skipped NX setup because the schematics does not run in an NX monorepo');
      return registerAngularActions(tree, context);
    }

    const templateNx = apply(url('./templates/nx'), [
      template({
        ...options,
        projectName
      }),
      renameTemplateFiles(),
      move(targetPath)
    ]);

    const rule = mergeWith(templateNx, MergeStrategy.Overwrite);
    return rule(tree, context);
  };

  /**
   * Generate the base file of new module
   *
   * @param tree File tree
   * @param context Context of the schematics
   */
  const generateModuleBase: Rule = (tree, context) => {
    const o3rCorePackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const o3rCorePackageJson: PackageJson & { generatorDependencies?: Record<string, string> } = JSON.parse(readFileSync(o3rCorePackageJsonPath)!.toString());
    // prepare needed deps for schematics
    const otterVersion = o3rCorePackageJson.dependencies!['@o3r/schematics'];

    /* eslint-disable @typescript-eslint/naming-convention */
    const versions = {
      'angular': o3rCorePackageJson.peerDependencies!['@angular/cli'],
      'angular-devkit': o3rCorePackageJson.peerDependencies!['@angular-devkit/core'],
      'angular-eslint': o3rCorePackageJson.generatorDependencies!['@angular-eslint/eslint-plugin'],
      'nrwl': o3rCorePackageJson.generatorDependencies!.nx,
      'typescript-eslint': o3rCorePackageJson.generatorDependencies!['@typescript-eslint/parser'],
      'cpy-cli': o3rCorePackageJson.generatorDependencies!['cpy-cli'],
      'eslint': o3rCorePackageJson.generatorDependencies!.eslint,
      'eslint-import-resolver-node': o3rCorePackageJson.generatorDependencies!['eslint-import-resolver-node'],
      'eslint-plugin-jest': o3rCorePackageJson.generatorDependencies!['eslint-plugin-jest'],
      'eslint-plugin-jsdoc': o3rCorePackageJson.generatorDependencies!['eslint-plugin-jsdoc'],
      'eslint-plugin-prefer-arrow': o3rCorePackageJson.generatorDependencies!['eslint-plugin-prefer-arrow'],
      'eslint-plugin-unicorn': o3rCorePackageJson.generatorDependencies!['eslint-plugin-unicorn'],
      'jest': o3rCorePackageJson.generatorDependencies!.jest,
      'jest-junit': o3rCorePackageJson.generatorDependencies!['jest-junit'],
      'jest-preset-angular': o3rCorePackageJson.generatorDependencies!['jest-preset-angular'],
      'rxjs': o3rCorePackageJson.peerDependencies!.rxjs,
      'typescript': o3rCorePackageJson.peerDependencies!.typescript,
      'zone': o3rCorePackageJson.generatorDependencies!['zone.js'],
      'tslib': o3rCorePackageJson.dependencies!.tslib
    };
    const engineVersions = {
      'node': o3rCorePackageJson.engines!.node
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    const templateNx = apply(url('./templates/base'), [
      template({
        ...options,
        projectName,
        otterVersion,
        versions,
        engineVersions,
        isNxContext: isNxContext(tree),
        runner: process.env.npm_execpath && /[\\/][^\\/]yarn[^\\/]js$/.test(process.env.npm_execpath) ? 'yarn run' : 'npm run',
        tsconfigSpecPath: findConfigFileRelativePath(tree,
          ['tsconfig.test.json', 'tsconfig.spec.json', 'tsconfig.jest.json', 'tsconfig.jasmine.json', 'tsconfig.base.json', 'tsconfig.json'], targetPath),
        tsconfigBasePath: findConfigFileRelativePath(tree, ['tsconfig.base.json', 'tsconfig.json'], targetPath),
        tsconfigBuildPath: findConfigFileRelativePath(tree, ['tsconfig.build.json', 'tsconfig.base.json', 'tsconfig.json'], targetPath),
        eslintRcPath: findConfigFileRelativePath(tree, ['.eslintrc.json', '.eslintrc.js'], targetPath)
      }),
      renameTemplateFiles(),
      move(targetPath)
    ]);

    const rule = mergeWith(templateNx, MergeStrategy.Overwrite);
    return rule(tree, context);
  };

  /**
   * Update the root tsconfig files mappings
   *
   * @param tree File tree
   * @param context Context of the schematics
   */
  const updateTsonfigFiles: Rule = (tree, context) => {
    const tsconfigBase = findConfigFileRelativePath(tree, ['tsconfig.base.json', 'tsconfig.json'], '/');
    const tsconfigBuild = findConfigFileRelativePath(tree, ['tsconfig.build.json'], '/');
    if (tsconfigBase) {
      const configFile = tree.readJson(tsconfigBase) as TsConfigJson;
      if (configFile?.compilerOptions?.paths) {
        configFile.compilerOptions.paths[options.name] = [path.posix.join(options.path, options.name, 'src', 'public_api')];
        tree.overwrite(tsconfigBase, JSON.stringify(configFile, null, 2));
      } else {
        context.logger.warn(`${tsconfigBase} does not contain path mapping, the edition will be skipped`);
      }
    } else {
      context.logger.warn('No base TsConfig file found');
    }

    if (tsconfigBuild) {
      const configFile = tree.readJson(tsconfigBuild) as TsConfigJson;
      if (configFile?.compilerOptions?.paths) {
        configFile.compilerOptions.paths[options.name] = [
          path.posix.join(options.path, options.name, 'dist'),
          path.posix.join(options.path, options.name, 'src', 'public_api')
        ];
        tree.overwrite(tsconfigBuild, JSON.stringify(configFile, null, 2));
      } else {
        context.logger.warn(`${tsconfigBuild} does not contain path mapping, the edition will be skipped`);
      }
    }
  };

  return chain([
    generateModuleBase,
    registerNxActions,
    updateTsonfigFiles,
    (tree, context) => schematic('ng-add-create', { projectName, path: targetPath })(tree, context),
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}
