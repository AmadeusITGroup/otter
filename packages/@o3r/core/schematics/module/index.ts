/* eslint-disable @typescript-eslint/naming-convention */
import { chain, noop, Rule, schematic } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { applyEsLintFix, isNxContext } from '@o3r/schematics';
import { NgGenerateModuleSchema } from './schema';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { nxGenerateModule } from './rules/rules.nx';
import { ngGenerateModule } from './rules/rules.ng';

/**
 * Add an Otter compatible module to a monorepo
 *
 * @param options
 * @param rootPath
 */
export function generateModule(options: NgGenerateModuleSchema): Rule {

  /** Path to the folder where generate the new module */
  const targetPath = path.posix.resolve('/', options.path || 'packages', options.name);
  /** Name of the Nx Project in case of Nx monorepo */
  const projectName = options.projectName || options.name.replace(/^@/, '').replace('/', '-');

  const extendedOptions = { ...options, targetPath, projectName };

  return (tree, context) => {
    return chain([
      isNxContext(tree) ? nxGenerateModule(extendedOptions) : ngGenerateModule(extendedOptions),
      (t, c) => schematic('ng-add-create', { projectName, path: targetPath })(t, c), options.skipLinter ? noop() : applyEsLintFix(),
      options.skipInstall ? noop() : (t, c) => {
        c.addTask(new NodePackageInstallTask());
        return t;
      }
    ])(tree, context);
  };
}
