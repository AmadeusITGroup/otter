import { chain, externalSchematic, noop, Rule, strings } from '@angular-devkit/schematics';
import * as path from 'node:path';
import {
  applyEsLintFix,
  createSchematicWithMetricsIfInstalled,
  type DependencyToAdd,
  getPackagesBaseRootFolder,
  getWorkspaceConfig,
  isNxContext,
  O3rCliError,
  setupDependencies
} from '@o3r/schematics';
import { NgGenerateModuleSchema } from './schema';
import { nxGenerateModule } from './rules/rules.nx';
import { ngGenerateModule } from './rules/rules.ng';
import { PackageJson } from 'type-fest';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as fs from 'node:fs';

/**
 * Add an Otter compatible module to a monorepo
 * @param options Schematic options
 */
function generateModuleFn(options: NgGenerateModuleSchema): Rule {

  return (tree, context) => {
    const ownPackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf-8' })) as PackageJson;
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

    const dependencies: Record<string, DependencyToAdd> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@o3r/core': {
        inManifest: [
          {
            range: `~${ownPackageJsonContent.version!}`,
            types: [NodeDependencyType.Default]
          }
        ]
      }
    };

    return chain([
      isNx ? nxGenerateModule(extendedOptions) : ngGenerateModule(extendedOptions),
      setupDependencies({
        dependencies,
        skipInstall: options.skipInstall,
        ngAddToRun: Object.keys(dependencies),
        projectName: options.name
      }),
      (t, c) => externalSchematic('@o3r/core', 'ng-add', { ...options, projectName: extendedOptions.name })(t, c),
      (t, c) => externalSchematic('@o3r/core', 'ng-add-create', { name: extendedOptions.name, projectName: extendedOptions.name, path: targetPath })(t, c),
      options.skipLinter ? noop() : applyEsLintFix()
    ])(tree, context);
  };
}

/**
 * Add an Otter compatible module to a monorepo
 * @param options Schematic options
 */
export const generateModule = createSchematicWithMetricsIfInstalled(generateModuleFn);
