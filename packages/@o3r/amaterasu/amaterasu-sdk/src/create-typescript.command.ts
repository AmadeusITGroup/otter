/* eslint-disable @typescript-eslint/naming-convention */
import { Context, promiseSpawn } from '@ama-terasu/core';
import { dump, load } from 'js-yaml';
import { existsSync, promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { generateBasicNpmrc } from './commands.helpers';

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
  /** Azure PAT */
  'azure-token': string;
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
    '@dapi/generator-sdk': version !== '0.0.0' ? version : 'latest',
    yo: 'latest'
  };
  const azureRegistryUrls = [
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/',
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/'
  ];

  await context.getSpinner('Adding Otter/Dapi registry...').fromPromise(
    fs.writeFile(resolve(cwd, npmrcFile), generateBasicNpmrc(options['azure-token'])),
    'Registry file created'
  );

  await context.getSpinner('Generating SDK package...').fromPromise(
    (async () => {
      await promiseSpawn('npm init -y', { cwd, stderrLogger: logger.debug, logger });
      await promiseSpawn(`npm install --userconfig ${npmrcFile} --include dev ${Object.entries<string>(deps).map(([n, v]) => `${n}@${v}`).join(' ')}`, { cwd, stderrLogger: logger.debug, logger });
      // eslint-disable-next-line max-len
      await promiseSpawn(`npx yo --force=true @ama-sdk/sdk:shell --sdkPath "${inPackageCwd}" --projectName "${options.name}" --projectPackageName sdk --projectDescription "${options.name} SDK" --projectHosting "Azure DevOps"`, { cwd, stderrLogger: logger.debug, logger });
    })(),
    // TODO: simplify to the following line when migrated to schematics generation
    // eslint-disable-next-line max-len
    // promiseSpawn(`npx ${Object.entries(deps).map(([n, v]) => `-p ${n}@${v}`).join(' ')} --userconfig ${npmrcFile} yo${options.yes ? ' --force=true' : ''} @ama-sdk/sdk:shell --projectName "${options.name}" --projectPackageName sdk --projectDescription "${options.name} SDK" --projectHosting "Azure DevOps"`, { cwd, stderrLogger: logger.debug, logger }),
    `SDK Shell generated (in ${inPackageCwd})`
  );

  const npmrcFilePath = resolve(inPackageCwd, '.npmrc');
  if (existsSync(npmrcFilePath)) {
    const updateNpmrcTask = context.getSpinner('Updating generated .npmrc file...');
    updateNpmrcTask.start();
    const generatedNpmrc = await fs.readFile(npmrcFilePath, { encoding: 'utf-8' });
    const azurePatBase64 = Buffer.from(options['azure-token']).toString('base64');
    const newNpmrcContent = generatedNpmrc
      .replace(/_password=.*/gm, `$1=${azurePatBase64}`);
    await fs.writeFile(npmrcFilePath, newNpmrcContent);
    updateNpmrcTask.succeed('.npmrc file updated');
  }

  const yarnrcFilePath = resolve(inPackageCwd, '.yarnrc.yml');
  if (existsSync(yarnrcFilePath)) {
    const updateYarnrcTask = context.getSpinner('Updating generated .yarn.yml file...');
    updateYarnrcTask.start();

    const yarnrc: any = load(await fs.readFile(yarnrcFilePath, {encoding: 'utf8'}));
    if (yarnrc) {
      const azurePatIdentBase64 = Buffer.from(`AmadeusDigitalAirline:${options['azure-token']}`).toString('base64');
      yarnrc.npmRegistries ||= {};
      azureRegistryUrls.forEach((url) => {
        yarnrc.npmRegistries[url] ||= {};
        yarnrc.npmRegistries[url].npmAuthIdent = azurePatIdentBase64;
        yarnrc.npmRegistries[url].npmAlwaysAuth = true;
      });
      await fs.writeFile(yarnrcFilePath, dump(yarnrc));
    }
    updateYarnrcTask.succeed('.yarnrc.yml file updated');
  }

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
