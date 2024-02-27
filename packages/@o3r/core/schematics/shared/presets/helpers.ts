import {noop, type Rule} from '@angular-devkit/schematics';
import { type DependencyToAdd, getProjectNewDependenciesTypes, getWorkspaceConfig, setupDependencies } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {PackageJson} from 'type-fest';
import type {PresetOptions} from './preset.interface';

/**
 * Default implementation of the preset rule
 * @param moduleToInstall
 * @param options
 */
export function defaultPresetRuleFactory(moduleToInstall: string[], options: PresetOptions = {}): Rule {

  return (tree, _context) => {
    const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson;
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    if (!moduleToInstall.length) {
      return tree;
    }

    const dependencies = moduleToInstall.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `~${corePackageJsonContent.version}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }]
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>);

    if (options.dependenciesSetupConfig) {
      options.dependenciesSetupConfig.dependencies = {
        ...options.dependenciesSetupConfig.dependencies,
        ...dependencies
      };
    }

    return options.dependenciesSetupConfig ? noop : setupDependencies({
      projectName: options.projectName,
      dependencies,
      ngAddToRun: moduleToInstall
    });
  };
}
