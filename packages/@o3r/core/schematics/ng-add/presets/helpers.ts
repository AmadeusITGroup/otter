import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
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
 */
export function defaultPresetRuleFactory(moduleToInstall: string[]) {
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson;
  const o3rCoreVersion = corePackageJsonContent.version ? `@${corePackageJsonContent.version}` : '';

  return (options: PresetOptions = {}): Rule => {
    return async (tree, context) => {
      for (const dependency of moduleToInstall) {
        context.addTask(new AddDevInstall({
          packageName: dependency + o3rCoreVersion,
          hideOutput: false,
          quiet: false
        } as any));
        await lastValueFrom(context.engine.executePostTasks());
      }
      return () => chain(moduleToInstall.map((mod) => externalSchematic(mod, 'ng-add', options.forwardOptions || {})))(tree, context);
    };
  };
}
