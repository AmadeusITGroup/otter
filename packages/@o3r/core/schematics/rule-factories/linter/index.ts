import { apply, chain, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getExternalDependenciesVersionRange, getNodeDependencyList, getProjectFromTree, getTemplateFolder, ngAddPackages, readAngularJson } from '@o3r/schematics';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import * as path from 'node:path';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
const projectPackageJsonPath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'package.json');
const tsEslintParserDep = '@typescript-eslint/parser';
const eslintDep = 'eslint';
/**
 * Add or update the Linter configuration
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateLinter(options: { projectName: string | null }, rootPath: string): Rule {
  const projectEslintBuilderVersion = (require(projectPackageJsonPath) as { devDependencies: [key: string] }).devDependencies['@angular-eslint/builder'];
  const otterLinterDependencies: NodeDependency[] = getNodeDependencyList(
    getExternalDependenciesVersionRange([tsEslintParserDep, eslintDep], packageJsonPath),
    NodeDependencyType.Dev
  );
  otterLinterDependencies.push(
    { name: '@angular-eslint/builder', version: projectEslintBuilderVersion, type: NodeDependencyType.Dev, overwrite: false }
  );

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

      if (eslintFile.extends.indexOf(otterLinterDependencies[0].name) === -1) {
        eslintFile.extends.push(otterLinterDependencies[0].name);
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
   * @param _context
   */
  const editAngularJson = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree);

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

    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  /**
   * Add the Otter eslint dependency
   *
   * @param tree
   * @param _context
   */
  const addTslintDependency: Rule = (tree: Tree, _context: SchematicContext) => {
    otterLinterDependencies.forEach((dep) => addPackageJsonDependency(tree, dep));
    return tree;
  };

  return chain([
    updateTslintExtend,
    addTslintDependency,
    editAngularJson,
    ngAddPackages(['@o3r/eslint-config-otter', '@o3r/eslint-plugin'], { skipConfirmation: true, parentPackageInfo: '@o3r/core - linter updates' })
  ]);
}
