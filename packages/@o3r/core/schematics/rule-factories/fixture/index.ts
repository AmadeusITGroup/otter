/* eslint-disable @typescript-eslint/naming-convention */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';
import { getProjectFromTree } from '@o3r/schematics';

/**
 * Add fixture configuration
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.testingFramework
 * @param _rootPath
 */
export function updateFixtureConfig(options: { projectName: string | null; testingFramework: 'jest' | 'jasmine' }, _rootPath: string): Rule {

  const oldPaths = ['@otter/testing/core', '@otter/testing/core/*'];

  /**
   * Update test tsconfig
   *
   * @param tree
   * @param _context
   */
  const updateTestTsconfig: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || null);

    if (!workspaceProject) {
      return tree;
    }

    const testTarget = workspaceProject.architect && workspaceProject.architect.test;
    const tsconfig: string | undefined = testTarget && testTarget.options && testTarget.options.tsConfig;

    if (tsconfig && tree.exists(tsconfig)) {
      const tsconfigFile: any = commentJson.parse(tree.read(tsconfig)!.toString());
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
      const subFolder = options.testingFramework === 'jasmine' ? 'karma' : 'angular';
      tsconfigCompilerOptions.paths['@o3r/testing/core'] = [`node_modules/@o3r/testing/core/${subFolder}`];
      tsconfigCompilerOptions.paths['@o3r/testing/core/*'] = [`node_modules/@o3r/testing/core/${subFolder}/*`];
      tree.overwrite(tsconfig, commentJson.stringify(tsconfigFile, null, 2));
    }

    return tree;
  };

  return chain([
    updateTestTsconfig
  ]);
}
