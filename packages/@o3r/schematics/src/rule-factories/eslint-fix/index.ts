import { DirEntry, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { exec } from 'child_process';
import { dirname, join, resolve } from 'node:path';

/**
 * Linter options
 */
export interface LinterOptions {
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   *
   * @default true
   */

  force?: boolean;
  /**
   * If enabled, only errors are reported (--quiet option of ESLint CLI)
   *
   * @default true
   */
  hideWarnings?: boolean;
}

/**
 * Apply EsLint fix
 *
 * @param prootPath Root path
 * @param _prootPath
 * @param extension List of file extensions to lint
 * @param options Linter options
 */
export function applyEsLintFix(_prootPath = '/', extension: string[] = ['ts'], options?: LinterOptions): Rule {
  const linterOptions = {
    force: true,
    hideWarnings: true,
    ...options
  };

  return (tree: Tree, context: SchematicContext) => {

    // directory of the deepest file
    let dir: DirEntry | null = tree.getDir(
      dirname(
        tree.actions
          .map((action) => action.path.substr(1))
          .reduce((acc, path) => {
            const level = path.split('/').length;
            if (acc.level < level) {
              return { level, path };
            }
            return acc;
          }, {level: 0, path: ''}).path
      )
    );

    let eslintFile: string | undefined;
    do {
      eslintFile = dir.subfiles.find((f) => f.startsWith('.eslintrc'));
      if (eslintFile) {
        eslintFile = join(dir.path.substr(1), eslintFile);
        break;
      }

      dir = dir.parent;
    } while (dir !== null);

    if (dir === null || !eslintFile) {
      throw new SchematicsException('Asked to run lint fixes, but could not find a eslintrc config file.');
    }

    const files = tree.actions.reduce((acc: Set<string>, action) => {
      const filePath = action.path.substr(1);
      if (extension.some((ext) => filePath.endsWith(`.${ext}`)) && dir && action.path.startsWith(dir.path)) {
        acc.add(filePath);
      }

      return acc;
    }, new Set<string>());

    exec(
      'yarn eslint ' +
        Array.from(files).map((file) => `"${file}"`).join(' ') +
        ' --fix --color' +
        (linterOptions.hideWarnings ? ' --quiet' : '') +
        (eslintFile ? ` --config ${eslintFile} --parser-options=tsconfigRootDir:${resolve(process.cwd(), dirname(eslintFile))}` : ''),
      (_error, stdout, stderr) => {
        context.logger.info(stdout);
        if (!linterOptions.force) {
          context.logger.error(stderr);
        }
      }
    );
  };
}
