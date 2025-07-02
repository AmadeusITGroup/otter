import {
  execSync,
} from 'node:child_process';
import * as fs from 'node:fs';
import {
  join,
  resolve,
} from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  getPackageManagerRunner,
} from '@o3r/schematics';
import {
  createBuilderWithMetricsIfInstalled,
} from '../utils';
import type {
  RunScriptBuilderSchema,
} from './schema';

export default createBuilder<RunScriptBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  context.reportProgress(1, 1, `Running ${options.script} !!!`);
  const specifiedRoot = context.target?.project && (await context.getProjectMetadata(context.target.project)).root as string;
  const projectRoot = specifiedRoot ? resolve(context.workspaceRoot, specifiedRoot) : context.currentDirectory;

  const angularJsonPath = join(context.workspaceRoot, 'angular.json');
  const angularJson = fs.existsSync(angularJsonPath) ? JSON.parse(fs.readFileSync(angularJsonPath, { encoding: 'utf8' }).toString()) : undefined;
  if (!angularJson) {
    context.logger.warn(`angular.json file cannot be found by @o3r/core:${context.builder.builderName} builder.
Detection of package manager runner will fallback on the one used to execute the actual command.`);
  }
  const pmr = getPackageManagerRunner(angularJson);

  try {
    execSync(`${pmr} ${options.script}`, {
      stdio: ['inherit', 'inherit', 'inherit'],
      cwd: projectRoot,
      env: {
        ...process.env
      }
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || e.toString() };
  }
}));
