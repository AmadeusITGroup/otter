import { apply, chain, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import * as path from 'node:path';
import { getExternalDependenciesVersionRange, getNodeDependencyList } from '../../utility/dependencies';
import { getProjectFromTree, getTemplateFolder, readAngularJson } from '../../utility/loaders';

const packageJsonPath = path.resolve(__dirname, '..', '..', '..', '..', 'package.json');
const projectPackageJsonPath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', 'package.json');
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
  const myVersion = (require(packageJsonPath) as {version: string}).version;
  const projectEslintBuilderVersion = (require(projectPackageJsonPath) as {devDependencies: [key: string]}).devDependencies['@angular-eslint/builder'];
  const otterLinterDependencies: NodeDependency[] = getNodeDependencyList(
    getExternalDependenciesVersionRange([tsEslintParserDep, eslintDep], packageJsonPath),
    NodeDependencyType.Dev
  );
  otterLinterDependencies.push(
    { name: '@o3r/eslint-config-otter', version: `^${myVersion}`, type: NodeDependencyType.Dev, overwrite: true },
    { name: '@angular-eslint/builder', version: projectEslintBuilderVersion, type: NodeDependencyType.Dev, overwrite: true }
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

    } else {
      const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
        template({
          empty: ''
        })
      ]);
      const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
      return rule(tree, context);
    }

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
    workspaceProject.architect.lint = {
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
    editAngularJson
  ]);
}
