/* eslint-disable @typescript-eslint/naming-convention */
import { Context, promiseSpawn } from '@ama-terasu/core';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

/** Option to create an application */
export interface CreateTypescriptSdkOptions {
  /** SDK Name */
  name: string;
  /** Use Yarn instead of NPM */
  yarn?: boolean;
  /** Path of the folder to create the SDK package */
  path: string;
  /**
   * Set default options instead of requiring input
   *
   * @default false
   */
  yes?: boolean;
  /** Path to the specification used to generate the SDK */
  'specification'?: string;
}

/**
 * Create an empty Typescript SDK
 *
 * @param context Context of the command
 * @param options Options
 */
export const createTypescriptSdk = async (context: Context, options: CreateTypescriptSdkOptions) => {
  const { logger } = context;
  const cwd = resolve(process.cwd(), options.path);
  const inPackageCwd = resolve(cwd, 'SDK');
  const npmClient = options.yarn ? 'yarn' : 'npm';
  const { version } = require(resolve(__dirname, '..', 'package.json'));

  const npmrcFile = 'tmp.npmrc';
  const deps = {
    '@ama-sdk/schematics': version !== '0.0.0-placeholder' ? version : 'latest',
    yo: 'latest'
  };

  await context.getSpinner('Generating SDK package...').fromPromise(
    (async () => {
      await promiseSpawn('npm init -y', { cwd, stderrLogger: logger.debug, logger });
      await promiseSpawn(`npm install --userconfig ${npmrcFile} --include dev ${Object.entries<string>(deps).map(([n, v]) => `${n}@${v}`).join(' ')}`, { cwd, stderrLogger: logger.debug, logger });
      // eslint-disable-next-line max-len
      await promiseSpawn(`npx -p @angular-devkit/schematics-cli schematics @ama-sdk/schematics:typescript-shell --package-name sdk --description "${options.name} SDK"`, { cwd, stderrLogger: logger.debug, logger });
    })(),
    // TODO: simplify to the following line when migrated to schematics generation
    // eslint-disable-next-line max-len
    // promiseSpawn(`npx ${Object.entries(deps).map(([n, v]) => `-p ${n}@${v}`).join(' ')} --userconfig ${npmrcFile} yo${options.yes ? ' --force=true' : ''} @ama-sdk/sdk:shell --projectName "${options.name}" --projectPackageName sdk --projectDescription "${options.name} SDK" --projectHosting "Azure DevOps"`, { cwd, stderrLogger: logger.debug, logger }),
    `SDK Shell generated (in ${inPackageCwd})`
  );

  await context.getSpinner('Clean up setup materials').fromPromise(
    Promise.all([
      fs.unlink(resolve(cwd, npmrcFile)),
      fs.unlink(resolve(cwd, 'package.json')),
      fs.rm(resolve(cwd, 'node_modules'), {force: true, recursive: true})
    ]),
    'Setup material removed'
  );

  await context.getSpinner(`Installing dependencies with ${npmClient}...`).fromPromise(
    promiseSpawn(`${npmClient} install`, {cwd: inPackageCwd, stderrLogger: logger.debug, logger}),
    `NPM Dependency installed (with ${npmClient})`
  );

  if (options.specification) {
    await context.getSpinner('Creating specification file...').fromPromise(
      fs.copyFile(resolve(process.cwd(), options.specification), resolve(inPackageCwd, 'swagger-spec.yaml')),
      'swagger-spec.yaml file created'
    );

    await context.getSpinner('Generating SDK based on specification...').fromPromise(
      promiseSpawn(`${npmClient} run swagger:regen`, {cwd: inPackageCwd, stderrLogger: logger.debug, logger}),
      `SDK Code generated (in ${resolve(inPackageCwd, 'src')})`
    );
  }

  logger.info(`SDK created in ${inPackageCwd}`);
};
