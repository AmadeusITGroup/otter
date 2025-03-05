import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  type Rule,
  type SchematicContext,
  type TaskId,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  getPackageManager,
  NodeRunScriptTask,
  NpmExecTask,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

/** Dev Dependencies to install to setup Commit hooks */
export const commitHookDevDependencies = [
  'husky',
  'lint-staged',
  'editorconfig-checker',
  '@commitlint/cli',
  '@commitlint/config-angular',
  '@commitlint/config-conventional',
  '@commitlint/types'
];

/**
 * Retrieve the task callback function to initialization the commit hooks
 * @param context
 */
export function getCommitHookInitTask(context: SchematicContext) {
  return (taskIds?: TaskId[]) => {
    const packageManager = getPackageManager();
    const huskyTask = new NpmExecTask('husky init');
    const taskId = context.addTask(huskyTask, taskIds);
    const setupLintStage = new NodeRunScriptTask(`require('node:fs').writeFileSync('.husky/pre-commit', '${packageManager} exec lint-stage');`);
    context.addTask(setupLintStage, [taskId]);
  };
}

/**
 * Edit package.json to setup lint-staged config
 * @param tree
 * @param context
 */
export const editPackageJson: Rule = (tree, context) => {
  const packageJson = tree.readJson('/package.json') as PackageJson;
  if (packageJson['lint-staged']) {
    context.logger.debug('A Lint-stage configuration is already defined, the default value will not be applied');
    return tree;
  }
  packageJson['lint-staged'] = {
    '*': [
      'editorconfig-checker --verbose'
    ]
  };
  tree.overwrite('/package.json', JSON.stringify(packageJson));
};

/**
 * Add Commit Lint and husky configurations to Otter project
 */
export function generateCommitLintConfig(): Rule {
  return () => {
    const packageManager = getPackageManager();
    const templateSource = apply(url('./helpers/commit-hooks/templates'), [
      template({
        empty: '',
        packageManager
      }),
      renameTemplateFiles()
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return chain([
      editPackageJson,
      rule
    ]);
  };
}
