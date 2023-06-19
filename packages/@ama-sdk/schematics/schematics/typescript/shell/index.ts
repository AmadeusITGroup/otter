import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule, SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { readPackageJson } from '../../helpers/read-package';
import type { NgGenerateTypescriptSDKShellSchematicsSchema } from './schema';

/**
 * @param options
 */
export function ngGenerateTypescriptSDK(options: NgGenerateTypescriptSDKShellSchematicsSchema): Rule {

  return async (tree: Tree, context: SchematicContext) => {
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
      'jest': amaSdkSchematicsPackageJson.devDependencies!.jest,
      'ts-jest': amaSdkSchematicsPackageJson.devDependencies!['ts-jest'],
      'typescript': amaSdkSchematicsPackageJson.devDependencies!.typescript,
      '@openapitools/openapi-generator-cli': amaSdkSchematicsPackageJson.devDependencies!['@openapitools/openapi-generator-cli']
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
      projectHosting: options.hosting,
      sdkCoreVersion: amaSdkSchematicsPackageJson.version,
      angularVersion: amaSdkSchematicsPackageJson.dependencies!['@angular-devkit/core'],
      versions,
      ...openApiSupportedVersion ? {openApiSupportedVersion} : {},
      engineVersions,
      empty: ''
    };

    const baseRule = mergeWith(apply(url('./templates/base'), [
      template(properties),
      move(tree.root.path),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    return baseRule;
  };
}
