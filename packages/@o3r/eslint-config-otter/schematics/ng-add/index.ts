import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import { updateLinterConfigs } from './linter';

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        addVsCodeRecommendations, ngAddPackages, getWorkspaceConfig, getO3rPeerDeps, getProjectNewDependenciesType, ngAddPeerDependencyPackages, removePackages
      } = await import('@o3r/schematics');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true, /^@(?:o3r|ama-sdk|eslint-)/);
      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const dependencyType = getProjectNewDependenciesType(workspaceProject);
      const linterSchematicsFolder = path.resolve(__dirname, '..');
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const {NodeDependencyType} = await import('@schematics/angular/utility/dependencies');
      const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
      return () => chain([
        removePackages(['@otter/eslint-config-otter', '@otter/eslint-plugin']),
        ngAddPackages(depsInfo.o3rPeerDeps, {
          skipConfirmation: true,
          version: depsInfo.packageVersion,
          parentPackageInfo: depsInfo.packageName,
          projectName: options.projectName,
          dependencyType,
          workingDirectory
        }),
        ngAddPeerDependencyPackages(
          [
            'eslint',
            '@angular-eslint/builder',
            '@typescript-eslint/parser',
            '@typescript-eslint/eslint-plugin',
            'eslint-plugin-jsdoc',
            'eslint-plugin-prefer-arrow',
            'eslint-plugin-unicorn',
            'jsonc-eslint-parser'
          ],
          path.resolve(__dirname, '..', '..', 'package.json'),
          NodeDependencyType.Dev,
          {...options, workingDirectory, skipNgAddSchematicRun: true},
          '@o3r/eslint-config-otter - peer installs'
        ),
        addVsCodeRecommendations(['dbaeumer.vscode-eslint', 'stylelint.vscode-stylelint']),
        updateLinterConfigs(options, linterSchematicsFolder)
      ])(tree, context);
    } catch (e) {
      // eslint-config-otter needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/eslint-config-otter has failed.
      You need to install '@o3r/schematics' package to be able to use the eslint-config-otter package. Please run 'ng add @o3r/schematics' .`);
      throw (e);
    }
  };
}

/**
 * Add Otter eslint-config to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
