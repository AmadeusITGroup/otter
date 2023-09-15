/* eslint-disable no-shadow */
import { AmaCliModule } from '@ama-terasu/core';
import { spawn } from 'node:child_process';
import { platform } from 'node:process';
import { resolve } from 'node:path';
import { createWriteStream, existsSync, promises as fs } from 'node:fs';
import * as http from 'node:https';
import { extract } from 'tar';

const name = 'dodo';

const osMap: Record<string, string> = {
  'darwin': 'osx-aarch_64',
  'win32': 'windows-x86_64',
  'linux': 'linux-x86_64'
};

const destFolder = resolve(__dirname, '..', 'cli');

/**
 * Download Dodo CLI
 *
 * @param platform
 * @param dodoVersion
 */
const downloadDodoCli = async () => {
  const dodoVersion: string = JSON.parse(await fs.readFile(resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' })).dodo.version;
  const platformName = osMap[platform];

  if (!platformName) {
    throw new Error('Not supported OS');
  }

  try {
    await fs.mkdir(destFolder, { recursive: true });
  } catch (e) {
    // ignored
  }

  const destZipFileName = 'dodo.tgz';
  const file = `dodo-${dodoVersion}-${platformName}`;
  const destFile = resolve(destFolder, file + (platform === 'win32' ? '.exe' : ''));

  if (!existsSync(destFile)) {
    const destZipFilePath = resolve(destFolder, destZipFileName);
    const destZipFileStream = createWriteStream(destZipFilePath);
    await new Promise<void>((resolvePromise, reject) => {
      const call = http.get(`https://repository.rnd.amadeus.net/dga-acs-generic-production-adt/dodo/${dodoVersion}/${file}.tgz`, (response) => {
        response.pipe(destZipFileStream);
        destZipFileStream.on('finish', () => {
          destZipFileStream.close();
          resolvePromise();
        });
      });
      call.on('error', reject);
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await extract({ file: destZipFilePath, C: destFolder });
    await fs.unlink(destZipFilePath);
  }
  return destFile;
};

module.exports = {
  name,
  description: 'Bridge to Dodo CLI',
  init: async (yargs, baseContext) => {
    baseContext.showHelpMessage = () => {};
    const config = await yargs.parse();
    const args = config._.slice(1);
    const opts = Object.entries(config)
      .filter(([key]) => key.startsWith('-'))
      .map(([key, value]) => value === undefined ? key : `${key}=${value as string}`);
    const argsString = [...args, ...opts]
      .map((arg) => `"${arg}"`)
      .join(' ');

    const context = baseContext.getContext(config);
    try {
      const download = downloadDodoCli();
      await context.getSpinner('Downloading Dodo CLI...').fromPromise(download, 'Dodo Loaded', 'Failed to download Dodo');
      const cliPath = await download;
      const instance = spawn(`${cliPath} ${argsString}`, {shell: true});
      instance.stdout.setEncoding('utf8');
      instance.stderr.setEncoding('utf8');
      instance.stdout.pipe(process.stdout);
      instance.stderr.pipe(process.stderr);
      instance.on('close', (code) => process.exit(code !== null ? code : 0));
    } catch (err) {
      const logger = baseContext.getContext(config).logger;
      logger.debug(err);
      yargs.exit(1, new Error('CLI not found'));
    }
  }
} as AmaCliModule;
