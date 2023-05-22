import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NgAddSchematicsSchema } from '../../schematics/ng-add/schema';
import * as path from 'node:path';
import * as fs from 'node:fs';

/**
 * Add Otter testing to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        addVsCodeRecommendations,
        getProjectDepType,
        getO3rPeerDeps,
        ngAddPackages,
        ngAddPeerDependencyPackages,
        removePackages,
        registerPackageCollectionSchematics
      } = await import('@o3r/schematics');
      const testPackageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(testPackageJsonPath, { encoding: 'utf-8' }));
      const depsInfo = getO3rPeerDeps(testPackageJsonPath);
      const dependencyType = getProjectDepType(tree);

      return () => chain([
        removePackages(['@otter/testing']),
        addVsCodeRecommendations(['Orta.vscode-jest']),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          dependencyType: dependencyType
        }),
        ngAddPeerDependencyPackages(['pixelmatch', 'pngjs'], testPackageJsonPath, dependencyType, options),
        registerPackageCollectionSchematics(packageJson)
      ])(tree, context);

    } catch (e) {
      context.logger.error(`[ERROR]: Adding @o3r/testing has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' or '@o3r/schematics' to be able to use the testing package.
      Please run 'ng add @o3r/core' or 'ng add @o3r/schematics'. Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}
