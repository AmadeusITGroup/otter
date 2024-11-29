/**
 * Code copied from https://github.com/nrwl/nx/blob/20.1.x/packages/js/src/executors/tsc/tsc.impl.ts
 * Please check original LICENSE https://github.com/nrwl/nx/blob/master/LICENSE
 */
import * as path from 'node:path';
import * as ts from 'typescript';
import {
  ExecutorContext,
  isDaemonEnabled,
  joinPathFragments,
  output,
} from 'nx/src/devkit-exports';
import type { TypeScriptCompilationOptions } from '@nx/workspace/src/utilities/typescript/compilation';
import { CopyAssetsHandler } from '@nx/js/src/utils/assets/copy-assets-handler';
import { checkDependencies } from '@nx/js/src/utils/check-dependencies';
import {
  getHelperDependency,
  HelperDependency,
} from '@nx/js/src/utils/compiler-helper-dependency';
import {
  handleInliningBuild,
  isInlineGraphEmpty,
  postProcessInlinedDependencies,
} from '@nx/js/src/utils/inline';
import { updatePackageJson } from '@nx/js/src/utils/package-json/update-package-json';
import { ExecutorOptions, NormalizedExecutorOptions } from '@nx/js/src/utils/schema';
import { compileTypeScriptFiles } from '@nx/js/src/utils/typescript/compile-typescript-files';
import { watchForSingleFileChanges } from '@nx/js/src/utils/watch-for-single-file-changes';
import { getCustomTrasformersFactory, normalizeOptions } from './lib';
import { readTsConfig } from '@nx/js/src/utils/typescript/ts-config';
import { createEntryPoints } from '@nx/js/src/utils/package-json/create-entry-points';

export function determineModuleFormatFromTsConfig(
  absolutePathToTsConfig: string
): 'cjs' | 'esm' {
  const tsConfig = readTsConfig(absolutePathToTsConfig);
  if (
    tsConfig.options.module === ts.ModuleKind.ES2015 ||
    tsConfig.options.module === ts.ModuleKind.ES2020 ||
    tsConfig.options.module === ts.ModuleKind.ES2022 ||
    tsConfig.options.module === ts.ModuleKind.ESNext
  ) {
    return 'esm';
  } else {
    return 'cjs';
  }
}

export function createTypeScriptCompilationOptions(
  normalizedOptions: NormalizedExecutorOptions,
  context: ExecutorContext
): TypeScriptCompilationOptions {
  // Added `path.resolve` to have a valid absolute path on Windows
  return {
    outputPath: path.resolve(joinPathFragments(normalizedOptions.outputPath)),
    projectName: context.projectName,
    projectRoot: normalizedOptions.projectRoot,
    rootDir: path.resolve(joinPathFragments(normalizedOptions.rootDir)),
    tsConfig: path.resolve(joinPathFragments(normalizedOptions.tsConfig)),
    watch: normalizedOptions.watch,
    deleteOutputPath: normalizedOptions.clean,
    getCustomTransformers: getCustomTrasformersFactory(
      normalizedOptions.transformers
    ),
  } as any;
}

export async function* tscExecutor(
  _options: ExecutorOptions,
  context: any
) {
  const { sourceRoot, root } =
    context.projectsConfigurations.projects[context.projectName!];
  const options = normalizeOptions(_options, context.root, sourceRoot!, root);

  const { projectRoot, tmpTsConfig, target, dependencies } = checkDependencies(
    context,
    options.tsConfig
  );

  if (tmpTsConfig) {
    options.tsConfig = tmpTsConfig;
  }

  const tsLibDependency = getHelperDependency(
    HelperDependency.tsc,
    options.tsConfig,
    dependencies,
    context.projectGraph
  );

  if (tsLibDependency) {
    dependencies.push(tsLibDependency);
  }

  const assetHandler = new CopyAssetsHandler({
    projectDir: projectRoot,
    rootDir: context.root,
    outputDir: _options.outputPath,
    assets: _options.assets,
  });

  const tsCompilationOptions = createTypeScriptCompilationOptions(
    options,
    context
  );

  const inlineProjectGraph = handleInliningBuild(
    context,
    options,
    tsCompilationOptions.tsConfig
  );

  if (!isInlineGraphEmpty(inlineProjectGraph)) {
    tsCompilationOptions.rootDir = '.';
  }

  const typescriptCompilation = compileTypeScriptFiles(
    options,
    tsCompilationOptions,
    async () => {
      await assetHandler.processAllAssetsOnce();
      updatePackageJson(
        {
          ...options,
          additionalEntryPoints: createEntryPoints(
            options.additionalEntryPoints,
            context.root
          ),
          format: [determineModuleFormatFromTsConfig(options.tsConfig)],
        } as any,
        context,
        target,
        dependencies
      );
      postProcessInlinedDependencies(
        tsCompilationOptions.outputPath,
        tsCompilationOptions.projectRoot,
        inlineProjectGraph
      );
    }
  );

  if (!isDaemonEnabled() && options.watch) {
    output.warn({
      title:
        'Nx Daemon is not enabled. Assets and package.json files will not be updated when files change.',
    });
  }

  if (isDaemonEnabled() && options.watch) {
    const disposeWatchAssetChanges =
      await assetHandler.watchAndProcessOnAssetChange();
    const disposePackageJsonChanges = await watchForSingleFileChanges(
      context.projectName!,
      options.projectRoot,
      'package.json',
      () =>
        updatePackageJson(
          {
            ...options,
            additionalEntryPoints: createEntryPoints(
              options.additionalEntryPoints,
              context.root
            ),
            format: [determineModuleFormatFromTsConfig(options.tsConfig)],
          } as any,
          context,
          target,
          dependencies
        )
    );
    const handleTermination = async (exitCode: number) => {
      await typescriptCompilation.close();
      disposeWatchAssetChanges();
      disposePackageJsonChanges();
      process.exit(exitCode);
    };
    process.on('SIGINT', () => handleTermination(128 + 2));
    process.on('SIGTERM', () => handleTermination(128 + 15));
  }

  return yield* typescriptCompilation.iterator;
}

export default tscExecutor;
