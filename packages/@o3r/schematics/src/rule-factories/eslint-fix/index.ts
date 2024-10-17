import { DirEntry, noop, type Rule, SchematicContext, type TaskId, type Tree } from '@angular-devkit/schematics';
import { dirname, join } from 'node:path';
import { EslintFixTask, LinterOptions } from '../../tasks/index';

interface ApplyEslintFixOption extends LinterOptions {
  /** List of task to wait to run the linter */
  dependencyTaskIds?: TaskId[];
}

/**
 * Apply EsLint fix
 * @param prootPath Root path
 * @param _prootPath
 * @param extension List of file extensions to lint
 * @param options Linter options
 */
export function applyEsLintFix(_prootPath = '/', extension: string[] = ['ts'], options?: ApplyEslintFixOption): Rule {
  try {
    require.resolve('eslint/package.json');
  } catch {
    return noop();
  }

  const linterOptions: LinterOptions = {
    continueOnError: true,
    hideWarnings: true,
    ...options
  };

  return (tree: Tree, context: SchematicContext) => {
    const filesToBeLint = tree.actions
      .filter((a) => a.kind !== 'd')
      .map((action) => action.path.substring(1));

    // directory of the deepest file
    let dir: DirEntry | null = tree.getDir(
      dirname(
        filesToBeLint.reduce((acc, path) => {
          const level = path.split('/').length;
          if (acc.level < level) {
            return {level, path};
          }
          return acc;
        }, {level: 0, path: ''}).path
      )
    );

    let eslintFile: string | undefined;
    do {
      eslintFile = dir.subfiles.find((f) => f.startsWith('.eslintrc'));
      if (eslintFile) {
        eslintFile = join(dir.path.substring(1), eslintFile);
        break;
      }

      dir = dir.parent;
    } while (dir !== null);

    if (dir === null || !eslintFile) {
      context.logger.warn(`Asked to run lint fixes, but could not find a eslintrc config file.
You can consider to run later the following command to add otter linter rules: ng add @o3r/eslint-config-otter`);
    }

    const files = filesToBeLint.reduce((acc: Set<string>, filePath) => {
      if (extension.some((ext) => filePath.endsWith(`.${ext}`)) && dir && filePath.startsWith(dir.path.substring(1))) {
        acc.add(filePath);
      }

      return acc;
    }, new Set<string>());

    if (files.size) {
      context.addTask(
        new EslintFixTask(
          Array.from(files),
          undefined,
          eslintFile,
          linterOptions
        ),
        options?.dependencyTaskIds
      );
    }

    return tree;
  };
}
