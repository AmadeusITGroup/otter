import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getPackageManager } from '@o3r/dev-tools';
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
    const installOptions = getPackageManager();
    return {
      name: NodePackageName,
      options: {
        command: 'install',
        quiet: this.quiet,
        workingDirectory: this.workingDirectory,
        packageName: `${this.packageName!} ${installOptions === 'yarn' ? '--prefer-dev' : '-D'}`,
        packageManager: 'yarn'
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
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));
    const getDependencyVersion = (dependency: string) => packageJsonContent?.dependencies?.[dependency] || packageJsonContent?.peerDependencies?.[dependency] ?
      `@${packageJsonContent.dependencies?.[dependency] || packageJsonContent?.peerDependencies?.[dependency] as string}` : '';

    schematicsDependencies.forEach(
      (dependency) => {
        context.logger.info(`Installing ${dependency}${getDependencyVersion(dependency)}`);
        context.addTask(new DevInstall({
          packageManager: getPackageManager(),
          packageName: `${dependency}${getDependencyVersion(dependency)}`,
          hideOutput: false,
          quiet: false
        } as any));
      }
    );
    await lastValueFrom(context.engine.executePostTasks());
    return () => tree;
  };
}
