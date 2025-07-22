import {
  existsSync,
  promises as fs,
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  Context,
  promiseSpawn,
} from '@ama-terasu/core';

const { peerDependencies } = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json'), { encoding: 'utf8' }));

/** Option to create an application */
export interface CreateApplicationOptions {
  /** Application Name */
  name: string;
  /** Path of the folder to create the application */
  path: string;
  /**
   * Set default options instead of requiring input
   * @default false
   */
  yes?: boolean;
  /** Otter generator version to use */
  // eslint-disable-next-line @typescript-eslint/naming-convention -- CLI options are in kebab-case
  'otter-version': string;
  /**
   * use yarn instead of npm
   * @default false
   */
  yarn?: boolean;
  /**
   * install material with Otter
   * @default false
   */
  material?: boolean;
}

/**
 * Create an Otter Application
 * @param context Context of the command
 * @param options Options
 */
export const createApplication = async (context: Context, options: CreateApplicationOptions) => {
  const { logger } = context;

  let cwd = path.resolve(process.cwd(), options.path);
  const directory = options.name.replace(/ /g, '-');
  const npmClient = options.yarn ? 'yarn' : 'npm';
  const npmRunner = options.yarn ? 'yarn' : 'npx';

  const defaults = `${!!options.yes}`;

  const ngVersion: string = peerDependencies?.['@angular/cli'] || 'latest';

  if (!existsSync(cwd)) {
    await fs.mkdir(cwd, { recursive: true });
  }

  await context.getSpinner('Creating a new Angular application...').fromPromise(

    promiseSpawn(
      `npx -p @angular/cli@${ngVersion} ng new "${options.name}" --style=scss --defaults=${defaults} --directory=${directory} --package-manager=${options.yarn ? 'yarn' : 'npm'} --routing`,
      { cwd, logger, stderrLogger: (...args: any[]) => logger.debug(...args) }
    ),
    `Application created (in ${path.resolve(cwd, directory)})`
  );
  cwd = path.resolve(cwd, directory);

  await context.getSpinner('Installing NPM dependencies...').fromPromise(
    promiseSpawn(`${npmClient} install`, { cwd, logger, stderrLogger: (...args: any[]) => logger.debug(...args) }),
    `NPM dependencies installed (with ${npmClient})`
  );

  await context.getSpinner('Adding Otter dependencies...').fromPromise(
    promiseSpawn(`${npmRunner} ng add @o3r/core@${options['otter-version']} --defaults=${defaults} --skip-confirmation`, { cwd, logger, stderrLogger: (...args: any[]) => logger.debug(...args) }),
    'Otter dependencies registered'
  );

  if (options.material) {
    await context.getSpinner('Adding Material Dependency...').fromPromise(
      promiseSpawn(`${npmRunner} ng add @angular/material --defaults=${defaults} --skip-confirmation`, { cwd, logger, stderrLogger: (...args: any[]) => logger.debug(...args) }),
      'Material Design library registered'
    );

    const updateStyleTask = context.getSpinner('Updating styles...');
    updateStyleTask.start();
    const stylingFile = path.resolve(cwd, 'src/styles.scss');
    if (existsSync(stylingFile)) {
      const content = await fs.readFile(stylingFile, { encoding: 'utf8' });
      const style = content
        .replace('// @include mat-core', '@include mat-core')
        .replace('// @include angular-material-typography', '@include angular-material-typography')
        .replace('// @include angular-material-theme', '@include angular-material-theme');
      await fs.writeFile(stylingFile, style);
    } else {
      context.logger.error(`File ${stylingFile} not found`);
    }
    updateStyleTask.succeed('Style updated');
  }

  logger.info(`Application created in ${cwd}`);
};
