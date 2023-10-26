#!/usr/bin/env node

import { bold } from 'chalk';
import { program } from 'commander';
import * as glob from 'globby';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import * as winston from 'winston';

/** Console logger */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});

const dependencyTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
// eslint-disable-next-line no-underscore-dangle
const nodeWellKnownModules = require('node:repl')._builtinLibs;
program
  .description('[DEPRECATED] Checks that the dependencies imported in the code are declared in the package.json file')
  .option<string>('--root <directory>', 'Project root directory', (p) => resolve(process.cwd(), p), process.cwd())
  // eslint-disable-next-line max-len
  .option<string[]>('--ignore <...patterns>', 'Path patters to ignore', (p, previous) => ([...previous, ...p.split(',')]), ['**/node_modules/**', '**/dist/**', '**/dist-*/**', '**/mocks/**', '**/templates/**', '**/*.template'])
  .option('--ignore-workspace', 'Ignore the workspace and only check from the root directory')
  .option('--fail-on-error', 'Return a non-null status in case of dependency issue found')
  .parse(process.argv);

const {root, ignore, ignoreWorkspace, failOnError} = program.opts();

const packagePatterns: string[] = ignoreWorkspace ?
  join(root, 'package.json').replace(/\\/g, '/') :
  (require(join(root, 'package.json')).workspaces?.map((p: string) => join(p, 'package.json').replace(/\\/g, '/')) || []);

void (async () => {
  logger.warn('This script is deprecated, will be removed in Otter v12');
  const packageFiles = await glob(packagePatterns, { absolute: true});
  let fixFound = false;

  await Promise.all(packageFiles
    .sort()
    .map(async (packageFile) => {
      const packageJson = JSON.parse(readFileSync(packageFile, {encoding: 'utf8'}));
      const packageName = packageJson.name;
      const packageFolder = dirname(packageFile);

      const sourceFiles = glob(
        [join(packageFolder, '**', '*.{cts,mts,ts,tsx,cjs,mjs,js,jsx}')].map((pattern) => pattern.replace(/\\/g, '/')),
        {
          absolute: true,
          ignore
        }
      );

      const styleFiles = glob(
        [join(packageFolder, '**', '*.{css,scss}')].map((pattern) => pattern.replace(/\\/g, '/')),
        {
          absolute: true,
          ignore
        }
      );

      const deps = (await Promise.all([
        sourceFiles.then((files) => {
          return files
            .map((file) => readFileSync(file, { encoding: 'utf8' }))
            .reduce<string[]>((acc, content) => {
              return [
                ...acc,
                ...[
                  ...content.matchAll(/^import .* from ['"]([^.].*)['"];?/mg),
                  ...content.matchAll(/ ?= ?require\(['"]([^.].*)['"]\);?$/mg)
                ].map(([, dep]) => dep)
              ];
            }, []);
        }),
        styleFiles.then((files) => {
          return files
            .map((file) => readFileSync(file, { encoding: 'utf8' }))
            .reduce<string[]>((acc, content) => {
              return [
                ...acc,
                ...[...content.matchAll(/^@import ['"]~?([^.].*)['"];?$/mg)]
                  .map(([, dep]) => dep)
                  .filter((dep) => !dep.startsWith('http'))
              ];
            }, []);
        })
      ]))
        .flat()
        // get module name only
        .map((dep) => !dep.startsWith('@') ? dep.split('/')[0] : dep.split('/').slice(0, 2).join('/'))
        // filter node modules
        .filter((dep) => !dep.startsWith('node:') && !nodeWellKnownModules.includes(dep))
        // filter auto-reference
        .filter((dep) => dep !== packageName)
        // remove duplicates
        .filter((dep, i, arr) => arr.lastIndexOf(dep) === i);

      deps
        .filter((dep) => !dependencyTypes.some((type) => !!(packageJson[type]?.[dep] || packageJson[type]?.[`@types/${dep}`])))
        .forEach((dep) =>{
          fixFound = true;
          logger.warn(`${bold(packageName)} is missing a dependency to ${bold(dep)}`);
        });

    }));

  if (!fixFound) {
    logger.info('No missing package.json dependencies found');
  } else if (failOnError) {
    process.exit(1);
  }
})();
