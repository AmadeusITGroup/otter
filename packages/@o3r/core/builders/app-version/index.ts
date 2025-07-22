import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  createBuilderWithMetricsIfInstalled,
} from '../utils';
import {
  AppVersionBuilderSchema,
} from './schema';

export * from './schema';

const PACKAGE_JSON_NOT_FOUND = {
  error: 'package.json not found',
  success: false
} as const satisfies BuilderOutput;

const PACKAGE_JSON_INCORRECT = {
  error: 'package.json incorrect',
  success: false
} as const satisfies BuilderOutput;

/** Maximum number of steps */
const STEP_NUMBER = 2;

export default createBuilder<AppVersionBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  context.reportProgress(1, STEP_NUMBER, 'Find current version');
  const packageJsonFile = path.resolve(context.workspaceRoot, 'package.json');
  if (!fs.existsSync(packageJsonFile)) {
    return PACKAGE_JSON_NOT_FOUND;
  }
  const packageJson = await fs.promises.readFile(packageJsonFile, { encoding: 'utf8' });
  let version: string;
  try {
    version = JSON.parse(packageJson).version;
    context.logger.info(`Current version: ${version}`);
  } catch {
    return PACKAGE_JSON_INCORRECT;
  }

  context.reportProgress(2, STEP_NUMBER, 'Running @o3r/core:pattern-replacement');
  const builderName = '@o3r/core:pattern-replacement';
  const buildOptions = await context.validateOptions({
    files: [options.file],
    searchValue: options.versionToReplace,
    replaceValue: version
  }, builderName);
  const build = await context.scheduleBuilder(builderName, buildOptions);

  // Stop pattern-replacement build if app-version stops
  context.addTeardown(async () => await build.stop());

  return build.result;
}));
