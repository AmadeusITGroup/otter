import { isJsonObject } from '@angular-devkit/core';
import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';

const packageJsonPath = '/package.json';
const swaggerIgnorePath = '/.swagger-codegen-ignore';
const openApiIgnorePath = '/.openapi-generator-ignore';
const openApiConfigPath = 'openapitools.json';
const packageManager = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';

/**
 * Install dev dependency on your application
 *
 * Note: it should not be moved to other packages as it should run before the installation
 * of peer dependencies
 */
class DevInstall extends NodePackageInstallTask {
  public quiet = false;

  /** @inheritdoc */
  public toConfiguration() {
    const installOptions = packageManager;
    return {
      name: NodePackageName,
      options: {
        command: 'install',
        quiet: this.quiet,
        workingDirectory: this.workingDirectory,
        packageName: `${this.packageName!} ${installOptions === 'yarn' ? '--prefer-dev' : '-D'}`,
        packageManager: installOptions
      }
    };
  }
}

/**
 * Rule to update package.json scripts using yeoman generator from `@ama-sdk/generator-sdk`
 *
 * @param tree Tree
 * @param context SchematicContext
 */
export const updatePackageJsonScripts: Rule = (tree, context) => {
  const packageJson = tree.readJson(packageJsonPath);
  if (!isJsonObject(packageJson)) {
    context.logger.error('Failed to read correctly the package.json');
    return tree;
  }
  if (!isJsonObject(packageJson.scripts)) {
    context.logger.error(
      'Failed to read correctly the scripts in the package.json'
    );
    return tree;
  }
  const scripts = Object.entries(packageJson.scripts).reduce(
    (acc, [scriptName, cmd]) => {
      if (typeof cmd === 'string') {
        acc[scriptName] = cmd
          .replace(/\byo\b/g, 'schematics') // Migrate from yeoman to schematics
          .replace(
            // Change generator path to schematics collection:name
            /(\$\(yarn resolve |\.?\/?node_modules\/)@ama-sdk\/generator-sdk\/(src\/)?generators\/([\w-]+)\)?\s/g,
            '@ama-sdk/schematics:$3 '
          )
          .replace(
            /@ama-sdk\/generator-sdk\/(src\/)?generators/g,
            '@ama-sdk/schematics/schematics'
          ) // Change relative path for swaggerConfigPath
          .replace(
            /(@ama-sdk\/schematics\/schematics\/)java-client-core/g,
            '$1java/client-core'
          ) // Change java client core path
          .replace(
            /@ama-sdk\/(schematics|generator-sdk):(core|shell|create|mock)/g,
            '@ama-sdk/schematics:typescript-$2'
          ) // Change typescript schematics name
          .replaceAll('--swaggerSpecPath', '--spec-path') // Schematics arguments should be kebab-case
          .replaceAll('--swaggerConfigPath', '--swagger-config-path') // Schematics arguments should be kebab-case
          .replace(
            // Remove swagger config path if it is the default value
            / --swagger-config-path[= ]?(\.\/)?node_modules\/@ama-sdk\/schematics\/schematics\/java\/client-core\/templates\/swagger-codegen-java-client\/config\/swagger-codegen-config.json/,
            ''
          );
      }
      return acc;
    },
    packageJson.scripts
  );
  packageJson.scripts = scripts;
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  return tree;
};

/**
 * Create or udpate the OpenApi configuration with the version supported by the application
 * Set a storage directory for the generator jar to avoid any issue with pnp setups as it would try to install it directly in the node_module
 *
 * @param tree
 */
const createOpenApiToolsConfig: Rule = (tree) => {
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson & { openApiSupportedVersion: string };
  const openApiGeneratorVersion = amaSdkSchematicsPackageJsonContent.openApiSupportedVersion.replace(/\^|~/, '');
  const openApiDefaultStorageDir = '.openapi-generator';
  if (tree.exists(openApiConfigPath)) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const openapitoolsConfig = tree.readJson(openApiConfigPath) as { 'generator-cli'?: { storageDir?: string; version?: string } } || {};
    openapitoolsConfig['generator-cli'] = {storageDir: openApiDefaultStorageDir, ...openapitoolsConfig['generator-cli'], version: openApiGeneratorVersion};
    tree.overwrite(openApiConfigPath, JSON.stringify(openapitoolsConfig));
  } else {
    tree.create(openApiConfigPath, JSON.stringify({
      $schema: 'https://raw.githubusercontent.com/OpenAPITools/openapi-generator-cli/master/apps/generator-cli/src/config.schema.json',
      spaces: 2,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'generator-cli': {
        version: openApiGeneratorVersion,
        storageDir: openApiDefaultStorageDir
      }
    }));
  }
  return tree;
};

/**
 * Install the npm open api generator cli package
 *
 * @param tree
 * @param context
 */
const installOpenApiToolsCli: Rule = async (tree, context) => {
  const packageJsonContent = tree.readJson(packageJsonPath) as PackageJson;
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson & { openApiSupportedVersion: string };
  const amaSdkSchematicsOpenApiCliVersion = amaSdkSchematicsPackageJsonContent.peerDependencies?.['@openapitools/openapi-generator-cli'] || '';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  packageJsonContent.devDependencies = {...packageJsonContent.devDependencies, '@openapitools/openapi-generator-cli': amaSdkSchematicsOpenApiCliVersion};
  context.addTask(new DevInstall({
    packageName: `@openapitools/openapi-generator-cli@${amaSdkSchematicsOpenApiCliVersion}`,
    hideOutput: false,
    quiet: false
  } as any));
  await lastValueFrom(context.engine.executePostTasks());
  return () => tree;
};

/**
 * Replace the swagger ignore file with an openapi one
 *
 * @param tree
 */
const replaceSwaggerIgnore: Rule = (tree) => {
  const swaggerIgnoreContent = tree.exists(swaggerIgnorePath) && tree.readText(swaggerIgnorePath);
  if (swaggerIgnoreContent && !tree.exists(openApiIgnorePath)) {
    tree.create(openApiIgnorePath, swaggerIgnoreContent);
    tree.delete(swaggerIgnorePath);
  }
  return tree;
};

const registerPackageSchematics = async (tree: Tree, context: SchematicContext) => {
  if (!tree.exists('angular.json')) {
    return () => tree;
  }
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson;
  const amaSdkSchematicsVersion = amaSdkSchematicsPackageJsonContent.version ? `@${amaSdkSchematicsPackageJsonContent.version}` : '';
  const schematicsDependencies = ['@o3r/dev-tools', '@o3r/schematics'];
  for (const dependency of schematicsDependencies) {
    context.addTask(new DevInstall({
      packageName: dependency + amaSdkSchematicsVersion,
      hideOutput: false,
      quiet: false
    } as any));
    const packageJsonContent = tree.readJson('package.json') as PackageJson;
    packageJsonContent.devDependencies = {...packageJsonContent.devDependencies, [dependency]: amaSdkSchematicsVersion};
    tree.overwrite('package.json', JSON.stringify(packageJsonContent));
    await lastValueFrom(context.engine.executePostTasks());
  }
  return () => chain([
    ...schematicsDependencies.map((dep) => externalSchematic(dep, 'ng-add', {})),
    async (t, c) => {
      const {registerPackageCollectionSchematics} = await import('@o3r/schematics');
      return () => registerPackageCollectionSchematics(amaSdkSchematicsPackageJsonContent)(t, c);
    }
  ]);
};

/**
 * Add Otter ama-sdk-schematics to a Project
 *
 * @param options
 */
export function ngAdd(): Rule {

  return (tree, context) => chain([
    registerPackageSchematics,
    updatePackageJsonScripts,
    (t) => {
      const packageJson = tree.readText(packageJsonPath);
      const needsToInstallOpenApiGeneratorCli = packageJson.match(/@ama-sdk\/schematics:typescript-.*--spec-path ([.\\/a-zA-Z-]+) /)?.[1];
      return needsToInstallOpenApiGeneratorCli ? chain([replaceSwaggerIgnore, installOpenApiToolsCli, createOpenApiToolsConfig]) : t;
    }
  ])(tree, context);
}
