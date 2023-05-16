import * as chalk from 'chalk';
import { EOL } from 'node:os';
import { name, version } from '../../package.json';
import { formatTitle } from './format.helper';
import { isInstalled, ModuleDiscovery } from './module.helper';

/**
 * Retrieve the version of a dependency package with a nice formatting
 *
 * @param pck Dependency package
 * @returns the package version or undefined if not found
 */
export const getPackageFormattedVersion = (pck: ModuleDiscovery): string => {
  const officialMark = pck.isOfficialModule ? chalk.blue(String.fromCharCode(0x00AE)) : '';
  if (isInstalled(pck)) {
    const isOutdated = pck.version && pck.version !== pck.package.version;
    return `${pck.name}${officialMark}: ${(isOutdated ? chalk.yellow : chalk.green).bold(pck.package.version)}${isOutdated ? chalk.grey.italic(` (${pck.version!} available)`) : ''}`;
  } else {
    return `${pck.name}${officialMark}: ${chalk.grey.bold(pck.version)} ${chalk.grey.italic('(not installed)')}`;
  }
};


/**
 * Get message of the --version command which includes all the modules versions
 *
 * @param packageName Name of a dependency package
 * @param cliModules
 * @returns the package version or undefined if not found
 */
export const getPackageVersion = (cliModules: ModuleDiscovery[]) => {
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
