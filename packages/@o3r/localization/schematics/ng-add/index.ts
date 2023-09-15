import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { registerPackageCollectionSchematics, setupSchematicsDefaultParams } from '@o3r/schematics';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter localization to an Angular Project
 *
 * @param options for the dependencies installations
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {applyEsLintFix, install, getProjectDepType, getProjectRootDir, ngAddPackages, ngAddPeerDependencyPackages, getO3rPeerDeps} = await import('@o3r/schematics');
      const {updateI18n, updateLocalization} = await import('../localization-base');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      context.logger.info(`The package ${depsInfo.packageName as string} comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/localization/LOCALIZATION.md#Debugging');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
      const workingDirectory = options.projectName ? getProjectRootDir(tree, options.projectName) : '.';
      return () => chain([
        updateLocalization(options, __dirname),
        updateI18n(options),
        options.skipLinter ? noop() : applyEsLintFix(),
        // install ngx-translate and message format dependencies
        options.skipInstall ? noop : install,
        (t, c) => ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: `${depsInfo.packageName!} - setup`,
          dependencyType: getProjectDepType(t),
          workingDirectory
        })(t, c),
        ngAddPeerDependencyPackages(
          ['chokidar'], packageJsonPath, NodeDependencyType.Dev, {...options, workingDirectory, skipNgAddSchematicRun: true}, '@o3r/localization - install builder dependency'),
        updateCmsAdapter(options),
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component': {
            useLocalization: undefined
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-presenter': {
            useLocalization: undefined
          }
        })
      ])(tree, context);
    } catch (e) {
      // o3r localization needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/localization has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the localization package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
