import { exec, execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getPackageManagerExecutor, getWorkspaceConfig } from '../../utility/index';

/**
 * Linter options
 */
export interface LinterOptions {
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   * @default true
   * @deprecated please use continueOnError, will be removed in v10
   */
  force?: boolean;
  /**
   * Indicates if the linter process should succeed even if there are lint errors remaining
   * @default true
   */
  continueOnError?: boolean;
  /**
   * If enabled, only errors are reported (--quiet option of ESLint CLI)
   * @default true
   */
  hideWarnings?: boolean;
  /**
   * Linter configuration file path
   */
  configFile?: string;
}

/**
 * Apply eslint on `files`
 * @param files
 * @param linterOptions
 */
export function eslintFix(files: string[], linterOptions: LinterOptions): Rule {
  const {
    hideWarnings,
    configFile,
    force,
    continueOnError
  } = linterOptions;
  return (tree, context) => {
    const eslintFile = configFile && tree.exists(configFile) ? configFile : undefined;
    const workspaceConfig = getWorkspaceConfig(tree);
    try {
      const [packageManager, executor] = getPackageManagerExecutor(workspaceConfig).split(' ');
      const stdout = execFileSync(packageManager,
        [
          executor,
          'eslint',
          ...files.filter((f) => tree.exists(f)),
          '--fix',
          ...(hideWarnings ? ['--quiet'] : []),
          ...(eslintFile ? ['--config', eslintFile] : [])
        ]
      );
      context.logger.info(stdout.toString());
    } catch (error: any) {
      const errorMessage = error.toString();
      if (continueOnError ?? force) {
        context.logger.error(errorMessage);
      } else {
        throw new Error(errorMessage);
      }
    }
    return tree;
  };
}

/**
 * Apply EsLint fix
 * @deprecated will be removed in v10, please use `eslintFix`
 * @param _prootPath Root path
 * @param extension List of file extensions to lint
 * @param options Linter options
 */
export function applyEsLintFix(_prootPath = '/', extension: string[] = ['ts'], options?: LinterOptions): Rule {
  const linterOptions: LinterOptions = {
    continueOnError: true,
    force: true,
    hideWarnings: true,
    ...options
  };

  return (tree: Tree, context: SchematicContext) => {

    // directory of the deepest file
    let dir: DirEntry | null = tree.getDir(
      dirname(
        tree.actions
          .map((action) => action.path.substring(1))
          .reduce((acc, path) => {
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

    const files = tree.actions.reduce((acc: Set<string>, action) => {
      const filePath = action.path.substring(1);
      if (extension.some((ext) => filePath.endsWith(`.${ext}`)) && dir && action.path.startsWith(dir.path)) {
        acc.add(filePath);
      }

      return acc;
    }, new Set<string>());

    try {
      exec(
        `${getPackageManagerExecutor()} eslint ` +
        Array.from(files).map((file) => `"${file}"`).join(' ') +
        ' --fix --color' +
        (linterOptions.hideWarnings ? ' --quiet' : '') +
        (eslintFile ? ` --config ${eslintFile} --parser-options=tsconfigRootDir:${resolve(process.cwd(), dirname(eslintFile))}` : ''),
        (_error, stdout, stderr) => {
          context.logger.info(stdout);
          if (!linterOptions.continueOnError ?? !linterOptions.force) {
            context.logger.error(stderr);
          }
        }
      );
    } catch {
      context.logger.error('Could not run eslint');
    }
    return tree;
  };
}

/**
 * Retrieve the list of files to lint and the config file in the tree
 * @param tree
 * @param context
 * @param extensions the file extensions to lint
 */
export function getFilesToLintAndConfigFromTree(tree: Tree, context: SchematicContext, extensions: string[] = ['ts']): { files: string[]; configFile?: string } {
  // directory of the deepest file
  let dir: DirEntry | null = tree.getDir(
    dirname(
      tree.actions
        .map((action) => action.path.substring(1))
        .reduce((acc, path) => {
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

  const files = Array.from(
    tree.actions.reduce((acc: Set<string>, action) => {
      const filePath = action.path.substring(1);
      if (extensions.some((ext) => filePath.endsWith(`.${ext}`)) && dir && action.path.startsWith(dir.path)) {
        acc.add(filePath);
      }

      return acc;
    }, new Set<string>())
  );

  return {
    files,
    configFile: eslintFile
  };
}
