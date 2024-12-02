/**
 * Code copied from https://github.com/nrwl/nx/blob/20.1.x/packages/js/src/executors/tsc/lib/normalize-options.ts
 * Please check original LICENSE https://github.com/nrwl/nx/blob/master/LICENSE
 */
import { join, resolve } from 'path';
import type {
  ExecutorOptions,
  NormalizedExecutorOptions,
} from '@nx/js/src/utils/schema';
import {
  FileInputOutput,
  assetGlobsToFiles,
} from '@nx/js/src/utils/assets/assets';

export function normalizeOptions(
  options: ExecutorOptions,
  contextRoot: string,
  sourceRoot: string,
  projectRoot: string
): NormalizedExecutorOptions {
  const outputPath = join(contextRoot, options.outputPath);
  const rootDir = options.rootDir
    ? join(contextRoot, options.rootDir)
    : join(contextRoot, projectRoot);

  if (options.watch == null) {
    options.watch = false;
  }

  // TODO: put back when inlining story is more stable
  // if (options.external == null) {
  //   options.external = 'all';
  // } else if (Array.isArray(options.external) && options.external.length === 0) {
  //   options.external = 'none';
  // }

  if (Array.isArray(options.external) && options.external.length > 0) {
    const firstItem = options.external[0];
    if (firstItem === 'all' || firstItem === 'none') {
      options.external = firstItem;
    }
  }

  options.assets ??= [];
  const files: FileInputOutput[] = assetGlobsToFiles(
    options.assets,
    contextRoot,
    outputPath
  );

  return {
    ...options,
    root: contextRoot,
    sourceRoot,
    projectRoot,
    files,
    outputPath,
    tsConfig: join(contextRoot, options.tsConfig),
    rootDir,
    mainOutputPath: resolve(
      outputPath,
      options.main.replace(`${projectRoot}/`, '').replace('.ts', '.js')
    ),
  };
}
