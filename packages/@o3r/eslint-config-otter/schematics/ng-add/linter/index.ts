import { apply, chain, MergeStrategy, mergeWith, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getAllFilesInTree, getTemplateFolder, getWorkspaceConfig } from '@o3r/schematics';

const tsEslintParserDep = '@typescript-eslint/parser';
/**
 * Add or update the Linter configuration
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLinterConfigs(options: { projectName?: string | null | undefined }, rootPath: string): Rule {

  /**
   * Update or create the eslint.json file
   * @param tree
   * @param context
   */
  const updateTslintExtend: Rule = (tree: Tree, context: SchematicContext) => {
    const eslintFilePath = '/.eslintrc.json';
    const eslintExists = tree.exists(eslintFilePath);

    if (eslintExists) {
      const eslintFile = tree.readJson(eslintFilePath) as { extends?: string | string[] };
      eslintFile.extends = eslintFile.extends ? (eslintFile.extends instanceof Array ? eslintFile.extends : [eslintFile.extends]) : [];

      if (eslintFile.extends.indexOf(tsEslintParserDep) === -1) {
        eslintFile.extends.push(tsEslintParserDep);
      }

      tree.overwrite(eslintFilePath, JSON.stringify(eslintFile, null, 2));
      return tree;

    } else {
      const eslintConfigFiles = getAllFilesInTree(tree, '/', ['**/.eslintrc.json'], false).filter((file) => /\.eslintrc/i.test(file));
      if (!eslintConfigFiles.length) {
        return mergeWith(apply(url(getTemplateFolder(rootPath, __dirname)), [
          template({
            dot: '.'
          }),
          renameTemplateFiles()
        ]), MergeStrategy.Overwrite);
      } else {
        context.logger.warn('An unsupported format EsLint configuration already exists, an automatic update cannot be applied.');
        context.logger.warn(`You can manually extends "@o3r/eslint-config-otter" in your configuration ${eslintConfigFiles.map((f) => `"${f}"`).join(', ')}`);
      }
    }
    return tree;

  };

  /**
   * Update angular.json file to use ESLint builder.
   * @param tree
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    if (!workspace || !workspaceProject) {
      context.logger.warn('No project detected, linter task can not be added');
      return tree;
    }

    workspaceProject.architect ||= {};
    workspaceProject.architect.lint ||= {
      builder: '@angular-eslint/builder:lint',
      options: {
        eslintConfig: './.eslintrc.js',
        lintFilePatterns: [
          'src/**/*.ts'
        ]
      }
    };

    workspace.projects[options.projectName!] = workspaceProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  return chain([
    updateTslintExtend,
    editAngularJson
  ]);
}
