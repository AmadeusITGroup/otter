import { isJsonObject } from '@angular-devkit/core';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import { PackageJson } from 'type-fest';
import { lastValueFrom } from 'rxjs';

const packageJsonPath = '/package.json';

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
    const installOptions = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
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
          .replaceAll('--swaggerSpecPath', '--swagger-spec-path') // Schematics arguments should be kebab-case
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
 * Add Otter ama-sdk-schematics to a Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const amaSdkSchematicsPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), {encoding: 'utf-8'})) as PackageJson;
    const amaSdkSchematicsVersion = amaSdkSchematicsPackageJsonContent.version ? `@${amaSdkSchematicsPackageJsonContent.version}` : '';
    const schematicsDependencies = ['@o3r/dev-tools', '@o3r/schematics'];
    for (const dependency of schematicsDependencies) {
      context.addTask(new DevInstall({
        packageName: dependency + amaSdkSchematicsVersion,
        hideOutput: false,
        quiet: false
      } as any));
      await lastValueFrom(context.engine.executePostTasks());
    }

    return () => chain([
      ...schematicsDependencies.map((dep) => externalSchematic(dep, 'ng-add', {})),
      async (t, c) => {
        const { registerPackageCollectionSchematics } = await import('@o3r/schematics');
        return () => registerPackageCollectionSchematics(amaSdkSchematicsPackageJsonContent)(t, c);
      },
      updatePackageJsonScripts
    ])(tree, context);
  };
}
