import { chain, externalSchematic, noop, Rule, strings } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { applyEsLintFix, getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext, O3rCliError } from '@o3r/schematics';
import { NgGenerateModuleSchema } from './schema';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { nxGenerateModule } from './rules/rules.nx';
import { ngGenerateModule } from './rules/rules.ng';

/**
 * Add an Otter compatible module to a monorepo
 * @param options Schematic options
 */
export function generateModule(options: NgGenerateModuleSchema): Rule {

  return (tree, context) => {
    const packageJsonName = strings.dasherize(options.name);
    const cleanName = packageJsonName.replace(/^@/, '').replaceAll(/\//g, '-');

    const isNx = isNxContext(tree);
    const config = getWorkspaceConfig(tree);
    if (!config) {
      throw new O3rCliError('No workspace configuration file found');
    }
    const defaultRoot = getPackagesBaseRootFolder(tree, context, config, 'library');

    /** Path to the folder where generate the new module */
    const targetPath = path.posix.resolve('/', options.path || defaultRoot, cleanName);
    const extendedOptions = { ...options, targetPath, name: cleanName, packageJsonName: packageJsonName };

    return chain([
      isNx ? nxGenerateModule(extendedOptions) : ngGenerateModule(extendedOptions),
      (t, c) => externalSchematic('@o3r/core', 'ng-add', { ...options, projectName: extendedOptions.name })(t, c),
      (t, c) => externalSchematic('@o3r/core', 'ng-add-create', { name: extendedOptions.name, path: targetPath })(t, c),
      options.skipLinter ? noop() : applyEsLintFix(),
      options.skipInstall ? noop() : (t, c) => {
        c.addTask(new NodePackageInstallTask());
        return t;
      }
    ])(tree, context);
  };
}
