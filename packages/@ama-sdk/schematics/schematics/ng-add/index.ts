import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  isJsonObject,
} from '@angular-devkit/core';
import {
  chain,
  externalSchematic,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
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

const rootPackageJsonPath = '/package.json';
const schematicsPackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

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
 * Rule to update package.json scripts using yeoman generator from `@ama-sdk/generator-sdk`
 * @param tree Tree
 * @param context SchematicContext
 */
export const updatePackageJsonScripts: Rule = (tree, context) => {
  const packageJson = tree.readJson(rootPackageJsonPath);
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
            /(\$\(yarn resolve )?(\.?\/?node_modules\/)?@ama-sdk\/generator-sdk\/(src\/)?generators\/([\w-]+)\)?(\s)?/g,
            '@ama-sdk/schematics:$4$5'
          )
          .replace(
            /@ama-sdk\/generator-sdk\/(src\/)?generators/g,
            '@ama-sdk/schematics/schematics'
          ) // Change relative path for swaggerConfigPath
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
  tree.overwrite(rootPackageJsonPath, JSON.stringify(packageJson, null, 2));
  return tree;
};

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
 * Install the npm open api generator cli package
 * @param options
 */
const installDependencies = (options: NgAddSchematicsSchema): Rule => {
  return async (tree, context) => {
    const { setupDependencies, getWorkspaceConfig, getExternalDependenciesInfo } = await import('@o3r/schematics');
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectDirectory = workspaceProject?.root || '.';
    const projectPackageJson = tree.readJson(path.posix.join(projectDirectory, 'package.json')) as PackageJson;

    const externalDependenciesInfo = getExternalDependenciesInfo({
      devDependenciesToInstall: devDependenciesToInstall,
      dependenciesToInstall: dependenciesToInstall,
      o3rPackageJsonPath: schematicsPackageJsonPath,
      projectPackageJson,
      projectType: workspaceProject?.projectType
    },
    context.logger
    );
    return setupDependencies({
      projectName: options.projectName,
      dependencies: externalDependenciesInfo
    });
  };
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
    updatePackageJsonScripts,
    replaceSwaggerIgnore,
    installDependencies(options),
    createOpenApiToolsConfig
  ]);
}

/**
 * Add Otter ama-sdk-schematics to a Project
 * @param opts
 */
export const ngAdd = (opts: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(opts);
