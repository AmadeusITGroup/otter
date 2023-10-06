import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {registerPackageCollectionSchematics} from '@o3r/schematics';
import { updateCmsAdapter } from '../cms-adapter';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { registerDevtools } from './helpers/devtools-registration';

/**
 * Add Otter rules-engine to an Angular Project
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        ngAddPackages,
        getDefaultOptionsForSchematic,
        getO3rPeerDeps,
        getProjectNewDependenciesType,
        getWorkspaceConfig,
        ngAddPeerDependencyPackages,
        removePackages,
        setupSchematicsDefaultParams
      } = await import('@o3r/schematics');
      options = {...getDefaultOptionsForSchematic(getWorkspaceConfig(tree), '@o3r/rules-engine', 'ng-add', options), ...options};
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      if (options.enableMetadataExtract) {
        depsInfo.o3rPeerDeps = [...depsInfo.o3rPeerDeps , '@o3r/extractors'];
      }
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const workingDirectory = workspaceProject?.root || '.';
      const dependencyType = getProjectNewDependenciesType(workspaceProject);
      const rule = chain([
        registerPackageCollectionSchematics(packageJson),
        setupSchematicsDefaultParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component': {
            useRulesEngine: undefined
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/core:component-container': {
            useRulesEngine: undefined
          }
        }),
        removePackages(['@otter/rules-engine', '@otter/rules-engine-core']),
        ngAddPeerDependencyPackages(['jsonpath-plus'], packageJsonPath, dependencyType, {...options, workingDirectory, skipNgAddSchematicRun: true}, '@o3r/rules-engine - install builder dependency'),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          projectName: options.projectName,
          dependencyType,
          workingDirectory
        }),
        ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
        await registerDevtools(options)
      ]);

      context.logger.info(`The package ${depsInfo.packageName!} comes with a debug mechanism`);
      context.logger.info('Get information on https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/how-to-use/debug.md');

      return () => rule(tree, context);
    } catch (e) {
      // rules-engine needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/rules-engine has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the rules-engine package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
