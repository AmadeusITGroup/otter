import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule, SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import {dump, load} from 'js-yaml';
import {isAbsolute, posix, relative} from 'node:path';
import {getPackageManagerName, NpmInstall} from '../../helpers/node-install';
import {readPackageJson} from '../../helpers/read-package';
import type {NgGenerateTypescriptSDKShellSchematicsSchema} from './schema';

/**
 * Generate Typescript SDK shell
 * @param options
 */
function ngGenerateTypescriptSDKFn(options: NgGenerateTypescriptSDKShellSchematicsSchema): Rule {

  const installRule = (_tree: Tree, context: SchematicContext) => {
    const workingDirectory = options.directory ? (isAbsolute(options.directory) ? relative(process.cwd(), options.directory) : options.directory) : '.';
    const installTask = new NpmInstall({workingDirectory, packageManager: options.packageManager, allowScripts: false});
    context.addTask(installTask);
  };

  const setupRule = async (tree: Tree, context: SchematicContext) => {
    const amaSdkSchematicsPackageJson = await readPackageJson();

    /* eslint-disable @typescript-eslint/naming-convention */
    const versions = {
      'tslib': amaSdkSchematicsPackageJson.dependencies!.tslib,
      '@types/jest': amaSdkSchematicsPackageJson.devDependencies!['@types/jest'],
      '@types/node': amaSdkSchematicsPackageJson.devDependencies!['@types/node'],
      '@typescript-eslint/eslint-plugin': amaSdkSchematicsPackageJson.devDependencies!['@typescript-eslint/eslint-plugin'],
      '@typescript-eslint/parser': amaSdkSchematicsPackageJson.devDependencies!['@typescript-eslint/parser'],
      'eslint': amaSdkSchematicsPackageJson.devDependencies!.eslint,
      'eslint-plugin-jest': amaSdkSchematicsPackageJson.devDependencies!['eslint-plugin-jest'],
      'eslint-plugin-jsdoc': amaSdkSchematicsPackageJson.devDependencies!['eslint-plugin-jsdoc'],
      'eslint-plugin-prefer-arrow': amaSdkSchematicsPackageJson.devDependencies!['eslint-plugin-prefer-arrow'],
      'eslint-plugin-unicorn': amaSdkSchematicsPackageJson.devDependencies!['eslint-plugin-unicorn'],
      'isomorphic-fetch': amaSdkSchematicsPackageJson.devDependencies!['isomorphic-fetch'],
      'cpy-cli': amaSdkSchematicsPackageJson.devDependencies!['cpy-cli'],
      'jest': amaSdkSchematicsPackageJson.devDependencies!.jest,
      'ts-jest': amaSdkSchematicsPackageJson.devDependencies!['ts-jest'],
      'globby': amaSdkSchematicsPackageJson.devDependencies!.globby,
      'typescript': amaSdkSchematicsPackageJson.devDependencies!.typescript,
      '@openapitools/openapi-generator-cli': amaSdkSchematicsPackageJson.devDependencies!['@openapitools/openapi-generator-cli'],
      'rxjs': amaSdkSchematicsPackageJson.dependencies!.rxjs
    };
    const openApiSupportedVersion = typeof amaSdkSchematicsPackageJson.openApiSupportedVersion === 'string' &&
      amaSdkSchematicsPackageJson.openApiSupportedVersion.replace(/\^|~/, '');
    context.logger.warn(JSON.stringify(openApiSupportedVersion));
    const engineVersions = {
      'node': amaSdkSchematicsPackageJson.engines!.node,
      'npm': amaSdkSchematicsPackageJson.engines!.npm,
      'yarn': amaSdkSchematicsPackageJson.engines!.yarn
    };

    const properties = {
      projectName: options.name,
      projectPackageName: options.package,
      projectDescription: options.description,
      packageManager: getPackageManagerName(options.packageManager),
      projectHosting: options.hosting,
      sdkCoreVersion: amaSdkSchematicsPackageJson.version,
      angularVersion: amaSdkSchematicsPackageJson.dependencies!['@angular-devkit/core'],
      angularEslintVersion: amaSdkSchematicsPackageJson.devDependencies!['@angular-eslint/eslint-plugin'],
      versions,
      ...openApiSupportedVersion ? {openApiSupportedVersion} : {},
      engineVersions,
      empty: ''
    };

    const targetPath = options.directory || tree.root.path;

    if (properties.packageManager === 'yarn') {
      const yarnrcPath = posix.join(targetPath, '.yarnrc.yml');
      const yarnrc = (load(tree.exists(yarnrcPath) ? tree.readText(yarnrcPath) : '') || {}) as any;
      yarnrc.nodeLinker ||= 'pnp';
      yarnrc.packageExtensions ||= {};
      yarnrc.packageExtensions['@ama-sdk/schematics@*'] = {
        dependencies: {
          'isomorphic-fetch': amaSdkSchematicsPackageJson.devDependencies!['isomorphic-fetch']
        }
      };
      if (tree.exists(yarnrcPath)) {
        tree.overwrite(yarnrcPath, dump(yarnrc, {indent: 2}));
      } else {
        tree.create(yarnrcPath, dump(yarnrc, {indent: 2}));
      }
    }

    const baseRule = mergeWith(apply(url('./templates/base'), [
      template(properties),
      move(targetPath),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    return baseRule(tree, context);
  };

  return chain([
    setupRule,
    ...(options.skipInstall ? [] : [installRule])
  ]);
}

/**
 * Generate Typescript SDK shell
 * @param options
 */
export const ngGenerateTypescriptSDK = createSchematicWithMetricsIfInstalled(ngGenerateTypescriptSDKFn);
