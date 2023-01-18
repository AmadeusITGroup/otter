import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as commentJson from 'comment-json';
import { getProjectFromTree } from '../../utility/loaders';

/**
 * Add fixture configuration
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param _rootPath
 */
export function updateFixtureConfig(options: { projectName: string | null }, _rootPath: string): Rule {

  const pathMap = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@o3r/testing/core': 'node_modules/@o3r/testing/core/angular',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@o3r/testing/core/*': 'node_modules/@o3r/testing/core/angular/*'
  };

  /**
   * Update test tsconfig
   *
   * @param tree
   * @param _context
   */
  const updateTestTsconfig: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
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

      if (tsconfigCompilerOptions.paths) {
        Object.keys(pathMap)
          .filter((k) => tsconfigCompilerOptions.paths[k] && tsconfigCompilerOptions.paths[k].indexOf(pathMap[k]) === -1)
          .forEach((k) => {
            tsconfigCompilerOptions.paths[k] = tsconfigCompilerOptions.paths[k] || [];
            tsconfigCompilerOptions.paths[k].push(pathMap[k]);
          });

      } else {
        tsconfigCompilerOptions.paths = {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/testing/core': ['node_modules/@o3r/testing/core/karma'],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '@o3r/testing/core/*': ['node_modules/@o3r/testing/core/karma/*']
        };
      }

      tree.overwrite(tsconfig, commentJson.stringify(tsconfigFile, null, 2));
    }

    return tree;
  };

  return chain([
    updateTestTsconfig
  ]);
}
