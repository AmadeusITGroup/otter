import {
  dirname,
  extname,
  join
} from 'node:path';
import {
  DirEntry,
  noop,
  type Rule,
  SchematicContext,
  type TaskId,
  type Tree
} from '@angular-devkit/schematics';
import {
  EslintFixTask,
  LinterOptions
} from '../../tasks/index';

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
      .filter((a) => a.kind !== 'd' && extension.includes(extname(a.path)))
      .map((action) => action.path.substring(1));

    if (tree.root.subfiles.some((f) => /eslint\.config\.{m,c,}[tj]s/.test(f))) {
      context.addTask(
        new EslintFixTask(
          Array.from(filesToBeLint),
          undefined,
          undefined,
          linterOptions
        ),
        options?.dependencyTaskIds
      );
      return tree;
    }

    // directory of the deepest file
    let dir: DirEntry | null = tree.getDir(
      dirname(
        filesToBeLint.reduce((acc, path) => {
          const level = path.split('/').length;
          if (acc.level < level) {
            return { level, path };
          }
          return acc;
        }, { level: 0, path: '' }).path
      )
    );

    let eslintRcFile: string | undefined;
    do {
      eslintRcFile = dir.subfiles.find((f) => f.startsWith('.eslintrc'));
      if (eslintRcFile) {
        eslintRcFile = join(dir.path.substring(1), eslintRcFile);
        break;
      }

      dir = dir.parent;
    } while (dir !== null);

    if (dir === null || !eslintRcFile) {
      context.logger.warn(`Asked to run lint fixes, but could not find a eslintrc config file.
You can consider to run later the following command to add otter linter rules: ng add @o3r/eslint-config`);
      return tree;
    }

    const files = new Set(
      filesToBeLint.filter((filePath) => filePath.startsWith(dir.path.substring(1)))
    );

    if (files.size > 0) {
      context.addTask(
        new EslintFixTask(
          Array.from(files),
          undefined,
          eslintRcFile,
          linterOptions
        ),
        options?.dependencyTaskIds
      );
    }

    return tree;
  };
}
