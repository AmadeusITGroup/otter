import type { Rule } from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Update workspace Tsconfig
 * @param options Schematic options
 * @param targetPath Path where the SDK has been generated
 * @param projectName Name of the project
 * @param scope scope of the package
 */
export function updateTsConfig(targetPath: string, projectName: string, scope: string): Rule {
  const tsconfigs = ['tsconfig.base.json', 'tsconfig.build.json', 'tsconfig.json'];
  const relativeTargetPath = targetPath.replace(/^\//, '');

  return (tree, context) => {
    const configs = tsconfigs
      .filter((tsconfig) => tree.exists(tsconfig))
      .map((tsconfig) => ({
        tsconfig,
        content: ts.parseConfigFileTextToJson(tsconfig, tree.readText(tsconfig)).config
      }))
      .filter(({ content }) => !!content);

    const configWithPath = configs.find((config) => !!config.content?.compilerOptions?.paths) || configs[0];

    if (!configWithPath) {
      context.logger.warn('No tsconfig found, the path mapping will not be updated');
      return tree;
    }

    configWithPath.content.compilerOptions ||= {};
    configWithPath.content.compilerOptions.paths ||= {};
    configWithPath.content.compilerOptions.paths[`${scope ? `@${scope}/` : ''}${projectName}`] = [
      `${relativeTargetPath}/dist`,
      `${relativeTargetPath}/src/index`
    ];
    configWithPath.content.compilerOptions.paths[`${scope ? `@${scope}/` : ''}${projectName}/*`] = [
      `${relativeTargetPath}/dist/*`,
      `${relativeTargetPath}/src/*`
    ];

    tree.overwrite(configWithPath.tsconfig, JSON.stringify(configWithPath.content, null, 2));
    return tree;
  };
}
