import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  externalSchematic,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
  registerPackageCollectionSchematics,
} from '@o3r/schematics';
import {
  lastValueFrom,
} from 'rxjs';
import type {
  JsonObject,
  PackageJson,
} from 'type-fest';
import {
  DevInstall,
} from '../helpers/node-install';
import type {
  OpenApiToolsConfiguration,
} from '../helpers/open-api-tools-configuration';
import type {
  NgAddSchematicsSchema,
} from './schema';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

const swaggerIgnorePath = '/.swagger-codegen-ignore';
const openApiIgnorePath = '/.openapi-generator-ignore';
const openApiConfigPath = 'openapitools.json';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@openapitools/openapi-generator-cli'
];

/**
 * Create or udpate the OpenApi configuration with the version supported by the application
 * Set a storage directory for the generator jar to avoid any issue with pnp setups as it would try to install it directly in the node_module
 * @param tree
 */
const createOpenApiToolsConfig: Rule = (tree) => {
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as
    PackageJson & { openApiSupportedVersion: string };
  const openApiGeneratorVersion = amaSdkSchematicsPackageJsonContent.openApiSupportedVersion.replace(/\^|~/, '');
  const openApiDefaultStorageDir = '.openapi-generator';
  if (tree.exists(openApiConfigPath)) {
    const openapitoolsConfig = tree.readJson(openApiConfigPath) as JsonObject & OpenApiToolsConfiguration;
    openapitoolsConfig['generator-cli'] = {
      storageDir: openApiDefaultStorageDir, ...openapitoolsConfig['generator-cli'],
      version: openApiGeneratorVersion
    };
    tree.overwrite(openApiConfigPath, JSON.stringify(openapitoolsConfig));
  } else {
    tree.create(openApiConfigPath, JSON.stringify({
      $schema: 'https://raw.githubusercontent.com/OpenAPITools/openapi-generator-cli/master/apps/generator-cli/src/config.schema.json',
      spaces: 2,
      'generator-cli': {
        version: openApiGeneratorVersion,
        storageDir: openApiDefaultStorageDir
      }
    }));
  }
  return tree;
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
  const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;
  const amaSdkSchematicsVersion = amaSdkSchematicsPackageJsonContent.version?.replace(/^v/, '');
  const schematicsDependencies = ['@o3r/schematics'];
  for (const dependency of schematicsDependencies) {
    context.addTask(new DevInstall({
      packageName: dependency + (amaSdkSchematicsVersion ? `@${amaSdkSchematicsVersion}` : ''),
      hideOutput: false,
      quiet: false
    } as any));
    const packageJsonContent = tree.readJson('package.json') as PackageJson;
    packageJsonContent.devDependencies = { ...packageJsonContent.devDependencies, [dependency]: amaSdkSchematicsVersion };
    tree.overwrite('package.json', JSON.stringify(packageJsonContent, null, 2));
    await lastValueFrom(context.engine.executePostTasks());
  }
  return () => chain([
    ...schematicsDependencies.map((dep) => externalSchematic(dep, 'ng-add', {})),
    registerPackageCollectionSchematics(amaSdkSchematicsPackageJsonContent)
  ]);
};

/**
 * Add Otter ama-sdk-schematics to a Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return () => chain([
    registerPackageSchematics,
    replaceSwaggerIgnore,
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall }),
    createOpenApiToolsConfig
  ]);
}

/**
 * Add Otter ama-sdk-schematics to a Project
 * @param opts
 */
export const ngAdd = (opts: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(opts);
