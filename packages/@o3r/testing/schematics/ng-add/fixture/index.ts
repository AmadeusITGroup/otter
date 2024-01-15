/* eslint-disable @typescript-eslint/naming-convention */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getTestFramework, getWorkspaceConfig } from '@o3r/schematics';

import * as ts from 'typescript';

/**
 * Add fixture configuration
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param registerUnitTestFixturePaths should add path mapping for unit test fixtures
 * @param options.testingFramework
 */
export function updateFixtureConfig(options: { projectName?: string | null | undefined; testingFramework?: string | null | undefined }, registerUnitTestFixturePaths: boolean): Rule {

  const oldPaths = ['@otter/testing/core', '@otter/testing/core/*'];
  /**
   * Update test tsconfig
   * @param tree
   * @param context
   */
  const updateTestTsconfig: Rule = (tree: Tree, context: SchematicContext) => {
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

      const testFramework = options.testingFramework || getTestFramework(getWorkspaceConfig(tree), context);
      if (testFramework === 'jest') {
        tsconfigCompilerOptions.types ||= [];
        if (tsconfigCompilerOptions.types.indexOf('jest') === -1) {
          tsconfigCompilerOptions.types.push('jest');
        }
      }
      tsconfigCompilerOptions.esModuleInterop = true;
      tsconfigCompilerOptions.outDir = 'test';

      tree.overwrite(tsconfig, JSON.stringify(tsconfigFile, null, 2));
    }

    return tree;
  };

  /**
   * Update base tsconfig paths with o3r fixtures
   * @param tree
   * @param context
   */
  const updateBaseTsConfigWithO3rFixtures: Rule = (tree: Tree, context: SchematicContext) => {
    const tsconfigs = ['tsconfig.base.json', 'tsconfig.build.json', 'tsconfig.json'];
    const configs = tsconfigs
      .filter((tsconfig) => tree.exists(tsconfig))
      .map((tsconfig) => ({
        tsconfig,
        content: ts.parseConfigFileTextToJson(tsconfig, tree.readText(tsconfig)).config
      }))
      .filter(({ content }) => !!content);

    if (!configs.length) {
      context.logger.warn('No base tsconfig found, the path mapping for otter fixtures will not be updated');
      return tree;
    }

    const configWithPath = configs.find((config) => !!config.content?.compilerOptions?.paths) || configs[0];

    configWithPath.content.compilerOptions.paths = Object.entries(configWithPath.content.compilerOptions.paths || {}).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (oldPaths.indexOf(key) === -1) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (registerUnitTestFixturePaths) {
      configWithPath.content.compilerOptions.baseUrl ||= '.';
      configWithPath.content.compilerOptions.paths['@o3r/testing/core'] = ['node_modules/@o3r/testing/core/angular'];
      configWithPath.content.compilerOptions.paths['@o3r/testing/core/*'] = ['node_modules/@o3r/testing/core/angular/*'];
    }

    tree.overwrite(configWithPath.tsconfig, JSON.stringify(configWithPath.content, null, 2));

    return tree;
  };

  return chain([updateTestTsconfig, updateBaseTsConfigWithO3rFixtures]);
}
