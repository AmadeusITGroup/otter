import { chain, externalSchematic } from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { lastValueFrom } from 'rxjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { PresetOptions } from './preset.interface';
import { AddDevInstall } from '@o3r/schematics';

/**
 * Default implementation of the preset rule
 *
 * @param moduleToInstall
 * @param options
 */
export function defaultPresetRuleFactory(moduleToInstall: string[], options: PresetOptions = {}): Rule {
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson;
  const o3rCoreVersion = corePackageJsonContent.version ? `@${corePackageJsonContent.version}` : '';
  const getInstalledVersion = async (packageName: string) => {
    try {
      return (await import(`${packageName}/package.json`)).version;
    } catch (e) {
      return;
    }
  };

  const installDependencies = async (_tree: Tree, context: SchematicContext) => {
    context.addTask(new AddDevInstall({
      packageName: moduleToInstall.map((dependency) => `${dependency}${o3rCoreVersion}`).join(' '),
      hideOutput: false,
      quiet: false
    } as any));
    await lastValueFrom(context.engine.executePostTasks());
  };

  const updatePackageJson = async (tree: Tree, _context: SchematicContext) => {
    const packageJsonContent = tree.readJson('package.json') as PackageJson;
    for (const dependency of moduleToInstall) {
      const version = await getInstalledVersion(dependency);
      packageJsonContent.devDependencies = {...packageJsonContent.devDependencies, [dependency]: version || corePackageJsonContent.version};
    }
    tree.overwrite('package.json', JSON.stringify(packageJsonContent, null, 2));
  };

  const executeNgAdd = chain(moduleToInstall.map((mod) => externalSchematic(mod, 'ng-add', options.forwardOptions || {})));

  return chain([
    installDependencies,
    updatePackageJson,
    executeNgAdd
  ]);
}
