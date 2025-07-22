import {
  promises as fs,
} from 'node:fs';
import * as path from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  sync as globbySync,
} from 'globby';
import * as ts from 'typescript';
import {
  createBuilderWithMetricsIfInstalled,
} from '../utils';
import {
  LibraryBuilderSchema,
} from './schema';

/** List of option dedicated to this build which should not be propagated to target build */
const libBuildOptions = ['target', 'skipJasmineFixtureWorkaround'];

export default createBuilder<LibraryBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  const specifiedRoot = context.target?.project && (await context.getProjectMetadata(context.target.project)).root as string;
  const ROOT_PATH = specifiedRoot ? path.resolve(context.workspaceRoot, specifiedRoot) : context.currentDirectory;
  const SRC_PATH = path.resolve(ROOT_PATH, 'src');
  const SRC_PACKAGE_JSON = path.resolve(SRC_PATH, 'package.json');

  const packageJsonFile = path.resolve(ROOT_PATH, 'package.json');
  await fs.copyFile(packageJsonFile, SRC_PACKAGE_JSON);

  // Run ngPackagr build
  const [project, target, configuration] = options.target.split(':');
  const nextBuildTarget = { project, target, configuration };

  const opts = Object.fromEntries(Object.entries(options)
    .filter(([key]) => !libBuildOptions.includes(key))
    .map<[string, any]>(([key, value]) => [key, value]));
  const build = await context.scheduleTarget(nextBuildTarget, opts);
  const buildResult = await build.result;

  /**
   * Workaround to remove additional Jest references bring by ngPackagr into jest fixtures
   */
  const patchJasmineFixtures = async () => {
    const tsConfig = (await context.getTargetOptions(nextBuildTarget)).tsConfig as string || undefined;
    const tsconfigPath = tsConfig && path.resolve(context.workspaceRoot, tsConfig);
    const configFile = tsconfigPath && ts.readConfigFile(tsconfigPath, (p) => ts.sys.readFile(p));
    const compilerOptions = configFile ? ts.parseJsonConfigFileContent(configFile.config, ts.sys, context.currentDirectory) : undefined;
    const outDir = compilerOptions?.options?.outDir;
    if (!outDir) {
      context.logger.warn(`Tsconfig file (${tsconfigPath || 'unknown'}) not read, the jasmine fixtures will not be patched`);
      return;
    }
    return Promise.all(
      globbySync(path.posix.join(outDir, '**', '*.jasmine.d.ts'), { cwd: context.currentDirectory })
        .map((file) => path.resolve(context.currentDirectory, file))
        .map(async (file) => {
          context.logger.debug(`Removing Jest reference from ${file}`);
          const content = (await fs.readFile(file, { encoding: 'utf8' })).replace(/^\/{3} <reference types="jest" \/>$/m, '');
          return fs.writeFile(file, content);
        })
    );
  };

  /** call in the end of the build process */
  const tearDown = async () => {
    await fs.unlink(SRC_PACKAGE_JSON);
    if (!options.skipJasmineFixtureWorkaround) {
      await patchJasmineFixtures();
    }
  };

  return options.watch
    ? new Promise((resolve) => process.once('SIGINT', async () => {
      await tearDown();
      resolve(buildResult);
    }))
    : tearDown().then(() => buildResult);
}));
