/* eslint-disable @typescript-eslint/naming-convention */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspaceConfig } from '@o3r/schematics';

import * as ts from 'typescript';

/**
 * Add fixture configuration
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param registerUnitTestFixturePaths should add path mapping for unit test fixtures
 */
export function updateFixtureConfig(options: { projectName?: string | null | undefined }, registerUnitTestFixturePaths: boolean): Rule {

  const oldPaths = ['@otter/testing/core', '@otter/testing/core/*'];
  /**
   * Update test tsconfig
   * @param tree
   * @param _context
   */
  const updateTestTsconfig: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      return tree;
    }

    const testTarget = workspaceProject.architect && workspaceProject.architect.test;
    const tsconfig: string | undefined = testTarget && testTarget.options && testTarget.options.tsConfig;

    if (tsconfig && tree.exists(tsconfig)) {
      const tsconfigFile = ts.parseConfigFileTextToJson(tsconfig, tree.readText(tsconfig)).config;
      tsconfigFile.compilerOptions = tsconfigFile.compilerOptions || {};

      const tsconfigCompilerOptions = tsconfigFile.compilerOptions;

      if (!tsconfigCompilerOptions.baseUrl) {
        tsconfigCompilerOptions.baseUrl = '.';
      }

      tsconfigCompilerOptions.lib = [...(tsconfigCompilerOptions.lib || []),
        'dom',
        'es2020',
        'scripthost'
      ].reduce<string[]>((libs, lib: string) => {
        if (libs.indexOf(lib) === -1) {
          libs.push(lib);
        }
        return libs;
      }, []);

      tsconfigCompilerOptions.paths = Object.entries(tsconfigCompilerOptions.paths || {}).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (oldPaths.indexOf(key) === -1) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (registerUnitTestFixturePaths) {
        tsconfigCompilerOptions.paths['@o3r/testing/core'] = ['node_modules/@o3r/testing/core/angular'];
        tsconfigCompilerOptions.paths['@o3r/testing/core/*'] = ['node_modules/@o3r/testing/core/angular/*'];
      }

      tree.overwrite(tsconfig, JSON.stringify(tsconfigFile, null, 2));
    }

    return tree;
  };

  return chain([updateTestTsconfig]);
}
