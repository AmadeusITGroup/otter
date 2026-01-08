import {
  exec,
  type ExecException,
} from 'node:child_process';
import {
  promises as fs,
} from 'node:fs';
import {
  createRequire,
} from 'node:module';
import {
  dirname,
  posix,
  resolve,
} from 'node:path';
import {
  promisify,
} from 'node:util';
import {
  globby,
} from 'globby';
import type {
  PackageJson,
} from 'type-fest';
import {
  OPENAPI_NPM_KEYWORDS,
} from '../constants.mjs';
import type {
  Context,
} from '../context.mjs';

/**
 * Options controlling how dependencies are listed for a package or project.
 */
export interface ListDependenciesOptions {
  /** Keyword of the whitelisted packages */
  keywordsWhitelist?: string[];

  /**
   * List of ignored models file which will not be part of the suggestion
   * @default ['package.json']
   */
  ignoreFiles?: string[];

  /**
   * Function to resolve the modules path
   * @default require.resolve
   */
  moduleResolve?: NodeJS.RequireResolve;
}

/**
 * List the artifacts and their exposed models for the declared dependencies
 * @param options
 */
export const listSpecificationArtifacts = async (options: ListDependenciesOptions & Context) => {
  const { cwd, keywordsWhitelist } = options;
  const { moduleResolve = createRequire(resolve(cwd, 'package.json')).resolve } = options;
  let packageList = '{}';
  try {
    const { stdout } = await promisify(exec)('npm ls -a --json --include prod --depth=0');
    packageList = stdout;
  } catch (e) {
    options?.logger?.warn('Error in "npm ls" run');
    options?.logger?.debug?.(e);
    if (!(e as ExecException).stdout) {
      throw e;
    }
    packageList = (e as ExecException).stdout!;
  }

  const packages = (await Promise.all(
    Object.keys(JSON.parse(packageList).dependencies || {})
      .map(async (packageName) => {
        const packageJsonPath = posix.join(packageName, 'package.json');
        try {
          const packageJson = moduleResolve(packageJsonPath);
          const baseDirectory = dirname(packageJson);
          const packageManifest: PackageJson = JSON.parse(await fs.readFile(packageJson, { encoding: 'utf8' }));
          return {
            packageManifest,
            baseDirectory
          };
        } catch (e) {
          options?.logger?.warn(`Error accessing ${packageJsonPath}. This package will be skipped`);
          options?.logger?.debug?.(e);
        }
      })
  )
  )
    .filter((obj) => !!obj)
    .filter(({ packageManifest }) => (keywordsWhitelist || OPENAPI_NPM_KEYWORDS).some((includedKeyword) => packageManifest.keywords?.includes(includedKeyword)));

  const artifacts = await Promise.all(packages
    .map(async ({ packageManifest, baseDirectory }) => {
      const packageModels = await globby('**/*.{json,yaml,yml}', { cwd: baseDirectory, ignore: options.ignoreFiles || ['package.json'] });
      const models = packageModels
        .map((model) => {
          try {
            return {
              model,
              modelPath: moduleResolve(posix.join(packageManifest.name!, model))
            };
          } catch {
            return;
          }
        })
        .filter((modelObj) => !!modelObj?.model);
      return { packageManifest, baseDirectory, models };
    }));

  return artifacts;
};
