/* eslint-disable @typescript-eslint/naming-convention */
import { Context, promiseSpawn } from '@ama-terasu/core';
import { dump, load } from 'js-yaml';
import { existsSync, promises as fs } from 'node:fs';
import * as path from 'node:path';
import { generateBasicNpmrc } from './commands.helpers';

/** Option to create an application */
export interface CreateExtensionOptions {
  /** Extension Name */
  name: string;
  /** Path of the folder to create the extension */
  path: string;
  /**
   * Set default options instead of requiring input
   *
   * @default false
   */
  yes?: boolean;
  /** Digital Api type */
  type: string;
  /** Version of the base digital spec */
  'spec-version': string;
  /** Azure PAT */
  'azure-token': string;
}

/**
 * Create an Otter Extension
 *
 * @param context Context of the command
 * @param options Options
 */
export const createExtension = async (context: Context, options: CreateExtensionOptions) => {
  const { logger } = context;
  const cwd = path.resolve(process.cwd(), options.path);

  const azureRegistryUrls = [
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/',
    '//pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/'
  ];
  const { version } = require(path.resolve(__dirname, '..', 'package.json'));

  const npmrcFile = 'tmp.npmrc';
  const deps = {
    '@dapi/generator-sdk': version !== '0.0.0' ? version : 'latest',
    yo: 'latest'
  };

  await context.getSpinner('Adding Otter/Dapi registry...').fromPromise(
    fs.writeFile(path.resolve(cwd, npmrcFile), generateBasicNpmrc(options['azure-token'])),
    'Registry file created'
  );

  await context.getSpinner('Generating extension module...').fromPromise(
    (async () => {
      await promiseSpawn('npm init -y', { cwd, stderrLogger: logger.debug, logger });
      await promiseSpawn(`npm install --userconfig ${npmrcFile} --include dev ${Object.entries<string>(deps).map(([n, v]) => `${n}@${v}`).join(' ')}`, { cwd, stderrLogger: logger.debug, logger });
      // eslint-disable-next-line max-len
      await promiseSpawn(`npx yo --force=true @ama-sdk/sdk:dapi-extension --name "${options.name}" --coreType ${options.type.replace(/^core-/, '')} --coreVersion "${options['spec-version']}"`, { cwd, stderrLogger: logger.debug, logger });
    })(),
    // TODO: simplify to the following line when migrated to schematics generation
    // eslint-disable-next-line max-len
    // promiseSpawn(`npx ${Object.entries(deps).map(([n, v]) => `-p ${n}@${v}`).join(' ')} --userconfig ${npmrcFile} yo${options.yes ? ' --force=true' : ''} @ama-sdk:dapi-extension --name "${options.name}" --coreType ${options.type.replace(/^core-/, '')} --coreVersion "${options['spec-version']}"`, { cwd, stderrLogger: logger.debug, logger }),
    `API Extension generated (in ${cwd})`
  );

  const npmrcFilePath = path.resolve(cwd, '.npmrc');
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

  const yarnrcFilePath = path.resolve(cwd, '.yarnrc.yml');
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
      fs.unlink(path.resolve(cwd, npmrcFile)),
      fs.rm(path.resolve(cwd, 'node_modules'), { force: true, recursive: true }),
      options.path !== '.' ? fs.unlink(path.resolve(cwd, 'package.json')) : undefined
    ]),
    'Setup material removed'
  );

  logger.info(`API extension created in ${cwd}`);
};
