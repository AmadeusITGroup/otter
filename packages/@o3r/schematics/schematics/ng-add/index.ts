import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import type { PackageJson } from 'type-fest';
import { AddDevInstall } from '@o3r/schematics';

/**
 * Add Otter schematics to an Angular Project
 */
export function ngAdd(): Rule {
  const schematicsDependencies = ['@angular-devkit/architect', '@angular-devkit/schematics', '@angular-devkit/core', '@schematics/angular', 'globby'];
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('Running ng add for schematics');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const treePackageJson = tree.readJson('./package.json') as PackageJson;
    const packageJsonContent: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: 'utf-8'}));
    const getDependencyVersion = (dependency: string) => packageJsonContent?.dependencies?.[dependency] || packageJsonContent?.peerDependencies?.[dependency];
    for (const dependency of schematicsDependencies) {
      const version = getDependencyVersion(dependency);
      context.logger.info(`Installing ${dependency}${version || ''}`);
      treePackageJson.devDependencies = {...treePackageJson.devDependencies, [dependency]: version};
      context.addTask(new AddDevInstall({
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
