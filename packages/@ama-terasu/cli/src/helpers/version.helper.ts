import * as chalk from 'chalk';
import { EOL } from 'node:os';
import { name, version } from '../../package.json';
import { formatTitle } from './format.helper';
import { isInstalled, ModuleDiscovery, ModuleDiscoveryList } from './module.helper';

/**
 * Retrieve the version of a dependency package with a nice formatting
 *
 * @param pck Dependency package
 * @returns the package version or undefined if not found
 */
export const getPackageFormattedVersion = (pck: ModuleDiscovery): string => {
  return `${pck.name}: ${chalk.grey.bold(pck.version)}${isInstalled(pck) ? chalk.green.italic(' (installed)') : ''}`;
};


/**
 * Get message of the --version command which includes all the modules versions
 *
 * @param packageName Name of a dependency package
 * @param cliModules
 * @returns the package version or undefined if not found
 */
export const getPackageVersion = (cliModules: ModuleDiscoveryList) => {
  const lines = [
    chalk.bold(`${name}: ${chalk.grey(version)}`),
    ''
  ];
  const modules = cliModules
    .map((modName) => getPackageFormattedVersion(modName))
    .filter((line): line is string => !!line);

  if (modules.length) {
    lines.push(
      formatTitle('Modules'),
      ...modules,
      ''
    );
  }

  return lines.join(EOL);
};
