
/** Npm packageManager */
export type SupportedPackageManagers = 'npm' | 'yarn';

/**
 * Get the Package Manager
 *
 * @param enforcedNpmManager package manager to enforce
 */
export function getPackageManagerName(enforcedNpmManager?: SupportedPackageManagers | '' | undefined | null): SupportedPackageManagers {
  return enforcedNpmManager || (process.env?.npm_execpath?.includes('yarn') ? 'yarn' : 'npm');
}

/**
 * Get package manager used in runs
 * Defaults to the package manager setup in process.env if no package manager set in angular.json
 *
 * @param angularJsonString Content of angular.json file
 */
export function getPackageManager(angularJsonString?: string | null) {
  let packageManager = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
  if (angularJsonString) {
    const angularJsonObj = JSON.parse(angularJsonString);
    if (angularJsonObj?.cli?.packageManager) {
      packageManager = angularJsonObj.cli.packageManager;
    }
  }
  return packageManager;
}

/**
 * Get command to execute scripts with your package manager
 *
 * @param angularJsonString
 */
export function getPackageManagerRunner(angularJsonString?: string | null) {
  return getPackageManager(angularJsonString) === 'yarn' ? 'yarn' : 'npx';
}
