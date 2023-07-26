import { chain, noop, Rule, schematic, strings } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { applyEsLintFix, getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext } from '@o3r/schematics';
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

  return (tree, context) => {
    const cleanName = strings.dasherize(options.name);
    const workspaceConfig = getWorkspaceConfig(tree);
    const isNx = isNxContext(tree);
    const defaultRoot = getPackagesBaseRootFolder(workspaceConfig, tree, 'library');

    /** Path to the folder where generate the new module */
    const targetPath = path.posix.resolve('/', options.path || defaultRoot, cleanName);
    const extendedOptions = { ...options, targetPath, name: cleanName };

    return chain([
      isNx ? nxGenerateModule(extendedOptions) : ngGenerateModule(extendedOptions),
      // TODO: Waiting for ng-add clean up to uncomment following line hand run ng-add @o3r/core to generated library
      // (t, c) => schematic('ng-add', { ...options, projectName })(t, c),
      (t, c) => schematic('ng-add-create', { projectName: options.name, path: targetPath })(t, c),
      options.skipLinter ? noop() : applyEsLintFix(),
      options.skipInstall ? noop() : (t, c) => {
        c.addTask(new NodePackageInstallTask());
        return t;
      }
    ])(tree, context);
  };
}
