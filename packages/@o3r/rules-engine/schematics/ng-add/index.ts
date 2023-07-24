import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {registerPackageCollectionSchematics} from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Add Otter rules-engine to an Angular Project
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        ngAddPackages,
        getO3rPeerDeps,
        getProjectDepType,
        ngAddPeerDependencyPackages,
        removePackages,
        setupSchematicsDefaultParams
      } = await import('@o3r/schematics');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(packageJsonPath);
      const dependencyType = getProjectDepType(tree);
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
        ngAddPeerDependencyPackages(['jsonpath-plus'], packageJsonPath, dependencyType, options, '@o3r/rules-engine - install builder dependency'),
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName, dependencyType })
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
