import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  main,
  // eslint-disable-next-line import/no-unresolved -- deep import
} from '@angular/compiler-cli/src/main';
import {
  NodeJSFileSystem,
  setFileSystem,
  // eslint-disable-next-line import/no-unresolved -- deep import
} from '@angular/compiler-cli/src/ngtsc/file_system';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import * as chokidar from 'chokidar';
import * as ts from 'typescript';
import {
  createBuilderWithMetricsIfInstalled,
} from '../utils';
import {
  NgcBuilderSchema,
} from './schema';

export * from './schema';

/** Maximum number of steps */
const STEP_NUMBER = 2;

export default createBuilder<NgcBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  context.reportProgress(0, STEP_NUMBER, 'Run ngc.');

  const args = ['--project', options.tsConfig];
  if (options.watch) {
    args.push('--watch');
  }

  setFileSystem(new NodeJSFileSystem());

  const buildResultCode = main(args);

  context.reportProgress(1, STEP_NUMBER, 'Handle package.json.');

  const handlePackageJson = (distPath: string) => {
    const packageJsonFile = path.resolve(context.currentDirectory, 'package.json');
    const packageJsonString = fs.readFileSync(packageJsonFile, { encoding: 'utf8' });
    const packageJson = JSON.parse(packageJsonString);
    if (packageJson.otterBuilder && packageJson.otterBuilder.entryPoint && (typeof packageJson.otterBuilder.entryPoint === 'string')) {
      const barrelName = path.parse(packageJson.otterBuilder.entryPoint).name;
      packageJson.typings = barrelName + '.d.ts';
      packageJson.main = barrelName + '.js';
      packageJson.module = barrelName + '.js';
      fs.writeFileSync(path.resolve(distPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    } else {
      context.logger.error(`unable to find otterBuilder.entryPoint in ${packageJsonFile}.`);
    }
  };

  const tsConfigFile = path.resolve(context.currentDirectory, options.tsConfig);

  try {
    const tsConfig = ts.readConfigFile(tsConfigFile, (pathFile) => fs.readFileSync(pathFile, { encoding: 'utf8' })).config;
    const dist = tsConfig.compilerOptions.outDir;
    handlePackageJson(dist);
    if (options.watch) {
      chokidar.watch(path.resolve(context.currentDirectory, 'package.json')).on('change', () => handlePackageJson(dist));
    }
    if (buildResultCode > 0) {
      context.logger.error(`ngc build failed with code ${buildResultCode}.`);
      return options.watch ? new Promise((resolve) => process.once('SIGINT', () => resolve({ success: false }))) : { success: false };
    }
    return options.watch ? new Promise((resolve) => process.once('SIGINT', () => resolve({ success: true }))) : { success: true };
  } catch (e: any) {
    context.logger.error(e);
    return {
      success: false
    };
  }
}));
