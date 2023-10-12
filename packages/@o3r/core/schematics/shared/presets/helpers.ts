import type {Rule} from '@angular-devkit/schematics';
import { getWorkspaceConfig, ngAddPackages } from '@o3r/schematics';
import {NodeDependencyType} from '@schematics/angular/utility/dependencies';
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
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
    if (!moduleToInstall.length) {
      return tree;
    }

    const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson;
    return ngAddPackages(moduleToInstall, {
      ...options,
      skipConfirmation: true,
      version: corePackageJsonContent.version,
      parentPackageInfo: '@o3r/core - preset setup',
      dependencyType: NodeDependencyType.Dev,
      workingDirectory
    });
  };
}
