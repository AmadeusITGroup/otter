import { apply, chain, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getProjectFromTree, getTemplateFolder, readAngularJson } from '@o3r/schematics';
import * as commentJson from 'comment-json';

const tsEslintParserDep = '@typescript-eslint/parser';


/**
 * Add or update the Linter configuration
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLinterConfigs(options: { projectName: string | null | undefined }, rootPath: string): Rule {

  /**
   * Update or create the eslint.json file
   *
   * @param tree
   * @param context
   */
  const updateTslintExtend: Rule = (tree: Tree, context: SchematicContext) => {
    const eslintFilePath = '/.eslintrc.json';
    const eslintExists = tree.exists(eslintFilePath);

    if (eslintExists) {
      const eslintFile = commentJson.parse(tree.read(eslintFilePath)!.toString()) as { extends?: string | string[] };
      eslintFile.extends = eslintFile.extends ? (eslintFile.extends instanceof Array ? eslintFile.extends : [eslintFile.extends]) : [];

      if (eslintFile.extends.indexOf(tsEslintParserDep) === -1) {
        eslintFile.extends.push(tsEslintParserDep);
      }

      tree.overwrite(eslintFilePath, commentJson.stringify(eslintFile, null, 2));
      return tree;

    } else if (!tree.exists('/.eslintrc.js')) {
      const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
        template({
          empty: ''
        })
      ]);
      const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
      return rule(tree, context);
    }
    return tree;

  };

  /**
   * Update angular.json file to use ESLint builder.
   *
   * @param tree
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const workspaceProject = getProjectFromTree(tree, options.projectName);

    if (!workspaceProject) {
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

    const { name, ...newProject } = workspaceProject;
    workspace.projects[name] = newProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  return chain([
    updateTslintExtend,
    editAngularJson
  ]);
}
