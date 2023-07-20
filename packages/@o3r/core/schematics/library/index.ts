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
 * @param options Schematic options
 */
export function generateModule(options: NgGenerateModuleSchema): Rule {

  /** Name of the Nx Project in case of Nx monorepo */
  const projectName = options.projectName || options.name.replace(/^@/, '').replace('/', '-');

  return (tree, context) => {
    const isNx = isNxContext(tree);

    const defaultRoot = isNx && (tree.readJson('/nx.json') as any)?.workspaceLayout?.libsDir || 'packages';

    /** Path to the folder where generate the new module */
    const targetPath = path.posix.resolve('/', options.path || defaultRoot, options.name);
    const extendedOptions = { ...options, targetPath, projectName };

    return chain([
      isNx ? nxGenerateModule(options) : ngGenerateModule(extendedOptions),
      // TODO: Waiting for ng-add clean up to uncomment following line hand run ng-add @o3r/core to generated library
      // (t, c) => schematic('ng-add', { ...options, projectName })(t, c),
      (t, c) => schematic('ng-add-create', { projectName, path: targetPath })(t, c),
      options.skipLinter ? noop() : applyEsLintFix(),
      options.skipInstall ? noop() : (t, c) => {
        c.addTask(new NodePackageInstallTask());
        return t;
      }
    ])(tree, context);
  };
}
