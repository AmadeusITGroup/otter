import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { NodePackageName } from '@angular-devkit/schematics/tasks/package-manager/options';

/**
 * Install dev dependency on your application
 *
 * Note: it should not be moved to other packages as it should run before the installation
 * of peer dependencies
 */
class DevInstall extends NodePackageInstallTask {
  /** @inheritDoc */
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
 * Add Otter schematics to an Angular Project
 */
export function ngAdd(): Rule {
  const schematicsDependencies = ['@angular-devkit/architect', '@angular-devkit/schematics', '@angular-devkit/core', '@schematics/angular', 'comment-json', 'eslint', 'globby'];
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('Running ng add for schematics');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const treePackageJson = tree.readJson('./package.json') as PackageJson;
    const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));
    const getDependencyVersion = (dependency: string) => packageJsonContent?.dependencies?.[dependency] || packageJsonContent?.peerDependencies?.[dependency];
    for (const dependency of schematicsDependencies) {
      const version = getDependencyVersion(dependency);
      context.logger.info(`Installing ${dependency}${version || ''}`);
      treePackageJson.devDependencies = {...packageJsonContent.devDependencies, [dependency]: version};
      context.addTask(new DevInstall({
        hideOutput: false,
        packageName: `${dependency}${version ? '@' + version : ''}`,
        quiet: false
      } as any));
      await lastValueFrom(context.engine.executePostTasks());
    }
    tree.overwrite('./package.json', JSON.stringify(treePackageJson));
    return () => tree;
  };
}
