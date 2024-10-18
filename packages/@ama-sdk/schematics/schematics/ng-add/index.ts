import type { OpenApiToolsConfiguration } from '../helpers/open-api-tools-configuration';
import { isJsonObject } from '@angular-devkit/core';
import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import { lastValueFrom } from 'rxjs';
import type { JsonObject, PackageJson } from 'type-fest';
import { DevInstall } from '../helpers/node-install';

const packageJsonPath = '/package.json';
const swaggerIgnorePath = '/.swagger-codegen-ignore';
const openApiIgnorePath = '/.openapi-generator-ignore';
const openApiConfigPath = 'openapitools.json';

/**
 * Rule to update package.json scripts using yeoman generator from `@ama-sdk/generator-sdk`
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
          .replace(
            // Remove swagger config path if it is the default value

            / --(swagger-config-path|swaggerConfigPath)[= ]?(\.\/)?node_modules\/@ama-sdk\/generator-sdk\/src\/generators\/java-client-core\/templates\/swagger-codegen-java-client\/config\/swagger-codegen-config.json/,
            ''
          )
          .replace(/\byo\b/g, 'schematics') // Migrate from yeoman to schematics
          .replace(
            // Change generator path to schematics collection:name
            /(\$\(yarn resolve )?(\.?\/?node_modules\/)?@ama-sdk\/generator-sdk\/(src\/)?generators\/([\w-]+)\)?(\s)?/g,
            '@ama-sdk/schematics:$4$5'
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
          .replaceAll(/--(swaggerSpecPath|swagger-spec-path)/g, '--spec-path') // Schematics arguments should be kebab-case
          .replaceAll('--swaggerConfigPath', '--spec-config-path'); // Schematics arguments should be kebab-case
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
 * @param tree
 */
const createOpenApiToolsConfig: Rule = (tree) => {
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf8'})) as PackageJson & { openApiSupportedVersion: string };
  const openApiGeneratorVersion = amaSdkSchematicsPackageJsonContent.openApiSupportedVersion.replace(/\^|~/, '');
  const openApiDefaultStorageDir = '.openapi-generator';
  if (tree.exists(openApiConfigPath)) {

    const openapitoolsConfig = tree.readJson(openApiConfigPath) as JsonObject & OpenApiToolsConfiguration;
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
 * @param tree
 * @param context
 */
const installOpenApiToolsCli: Rule = async (tree, context) => {
  const packageJsonContent = tree.readJson(packageJsonPath) as PackageJson;
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf8'})) as PackageJson & { openApiSupportedVersion: string };
  const amaSdkSchematicsOpenApiCliVersion = amaSdkSchematicsPackageJsonContent.peerDependencies?.['@openapitools/openapi-generator-cli'] || '';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  packageJsonContent.devDependencies = {...packageJsonContent.devDependencies, '@openapitools/openapi-generator-cli': amaSdkSchematicsOpenApiCliVersion};
  context.addTask(new DevInstall({
    packageName: `@openapitools/openapi-generator-cli@${amaSdkSchematicsOpenApiCliVersion}`,
    hideOutput: false,
    quiet: false
  } as any));
  await lastValueFrom(context.engine.executePostTasks());
  tree.overwrite(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
  return () => tree;
};

/**
 * Replace the swagger ignore file with an openapi one
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
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf8'})) as PackageJson;
  const amaSdkSchematicsVersion = amaSdkSchematicsPackageJsonContent.version?.replace(/^v/, '');
  const schematicsDependencies = ['@o3r/schematics'];
  for (const dependency of schematicsDependencies) {
    context.addTask(new DevInstall({
      packageName: dependency + (amaSdkSchematicsVersion ? `@${amaSdkSchematicsVersion}` : ''),
      hideOutput: false,
      quiet: false
    } as any));
    const packageJsonContent = tree.readJson('package.json') as PackageJson;
    packageJsonContent.devDependencies = {...packageJsonContent.devDependencies, [dependency]: amaSdkSchematicsVersion};
    tree.overwrite('package.json', JSON.stringify(packageJsonContent, null, 2));
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
 */
function ngAddFn(): Rule {

  return (tree, context) => chain([
    registerPackageSchematics,
    updatePackageJsonScripts,
    (t) => {
      const packageJson = tree.readText(packageJsonPath);
      const needsToInstallOpenApiGeneratorCli = /@ama-sdk\/schematics:typescript-/.test(packageJson);
      return needsToInstallOpenApiGeneratorCli ? chain([replaceSwaggerIgnore, installOpenApiToolsCli, createOpenApiToolsConfig]) : t;
    }
  ])(tree, context);
}

/**
 * Add Otter ama-sdk-schematics to a Project
 */
export const ngAdd = (): Rule => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngAddFn)(undefined);
};
