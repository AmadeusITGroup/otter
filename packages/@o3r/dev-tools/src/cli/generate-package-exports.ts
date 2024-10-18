#!/usr/bin/env node

import { program } from 'commander';
import * as globby from 'globby';
import { existsSync, promises as fs, readFileSync } from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import * as winston from 'winston';

/** Options of the CLI */
interface Options {
  outDir: string;
  srcDir: string;
  pattern: string;
  cwd: string;
  exportTypes: string[];
  verbose: boolean;
}

/** Console logger */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: new winston.transports.Console()
});

program
  .description('[DEPRECATED] Update package.json exports')
  .option<string>('--cwd <path>', 'Path to the root of the project', (rootPath) => path.resolve(process.cwd(), rootPath), process.cwd())
  .option<string>('-o, --outDir <path>', 'Path to folder containing the package.json to edit',
    (folderPath) => folderPath,
    './dist'
  )
  .option<string>('-s, --srcDir <path>', 'Path to source folder containing the source code',
    (folderPath) => folderPath,
    './src'
  )
  .option<string>('-p, --pattern <packages>', 'Pattern of the JSON filenames to read to determine sub entries',
    (value) => value,
    'package.json'
  )
  .option<string[]>('--export-types <...types>', 'Add additional supported export types',
    (value, mem) => ([...mem, ...value.split(',')]),
    ['typings', 'types', 'node', 'module', 'es2015', 'es2020', 'esm2015', 'esm2020', 'esm', 'default', 'require', 'import']
  )
  .option('-v, --verbose', 'Display debug logs')
  .parse(process.argv);

logger.warn('This script is deprecated, will be removed in Otter v12.');

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const { cwd, pattern, exportTypes, ...options} = program.opts() as Options;
const srcDir = path.resolve(cwd, options.srcDir);
const outDir = path.resolve(cwd, options.outDir);

logger.level = options.verbose ? 'debug' : 'info';

if (!existsSync(outDir)) {
  logger.error(`The output directory ${outDir} does not exist`);
  process.exit(1);
}

if (!existsSync(srcDir)) {
  logger.error(`The source directory ${srcDir} does not exist`);
  process.exit(2);
}

/**
 * Update the package.json with sub entries in package.json exports field
 */
const editPackageJson = async () => {
  const outputtedPackageJsonPath = path.join(outDir, 'package.json');
  const originPackageJsonPath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(outputtedPackageJsonPath, { encoding: 'utf8' })) as PackageJson;
  logger.debug(`Parsed outputed ${outputtedPackageJsonPath}`);
  const originPackageJson = existsSync(originPackageJsonPath) ? JSON.parse(await fs.readFile(originPackageJsonPath, { encoding: 'utf8' })) as PackageJson : {};
  logger.debug(`Parsed original ${originPackageJsonPath}`);

  packageJson.exports ||= {};
  (packageJson.exports as Record<string, PackageJson.Exports>)['./package.json'] ||= (packageJson.exports as Record<string, PackageJson.Exports>)?.['./package.json'] || { default: './package.json' };
  (packageJson.exports as Record<string, PackageJson.Exports>)['.'] ||= (packageJson.exports as Record<string, PackageJson.Exports>)?.['.'] || {
    ...Object.fromEntries(exportTypes.map((type) => [type, originPackageJson[type] as string | undefined])),
    default: originPackageJson.main || './index.js',
    node: (originPackageJson.node || originPackageJson.main) as PackageJson.Exports
  };

  const subPackagesPath = await globby(path.posix.join('**', pattern), { cwd: srcDir });
  logger.debug(`${subPackagesPath.length} sub entries found (pattern: "${path.posix.join('**', pattern)}" in ${srcDir}):`);
  subPackagesPath.forEach((subPackagePath) => logger.debug(`sub entry: ${subPackagePath}`));
  const exportMap = subPackagesPath.reduce<Record<string, any>>((acc, subPackagePathRelative) => {
    const subPackagePath = path.join(srcDir, subPackagePathRelative);
    const subPackage = JSON.parse(readFileSync(subPackagePath, { encoding: 'utf8' })) as PackageJson;
    const relativePath = ('./' + path.relative(srcDir, path.dirname(subPackagePath))).split(path.sep).join(path.posix.sep);
    acc[relativePath] = exportTypes.reduce<Record<string, string | undefined>>((exportsAcc, type) => {
      if (subPackage[type]) {
        exportsAcc[type] = ('./' + path.normalize(path.join(path.dirname(subPackagePathRelative), subPackage[type] as string))).split(path.sep).join(path.posix.sep);
      }
      return exportsAcc;
    }, {});
    return acc;
  }, {});
  packageJson.exports = { ...(packageJson.exports as Record<string, PackageJson.Exports>), ...exportMap };
  logger.info(`Edit package.json with ${Object.keys(exportMap).length} sub entries`);
  Object.keys(exportMap).forEach((exp) => logger.debug(`export sub entry: ${exp}`));
  await fs.writeFile(outputtedPackageJsonPath, JSON.stringify(packageJson, null, 2));
};


editPackageJson()
  .then(() => process.exit(0))
  .catch((err) => {
    throw err;
  });
