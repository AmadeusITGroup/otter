/**
 * Get package manager used in runs
 * Defaults to the package manager setup in process.env if no package manager set in angular.json
 * @deprecated You can use the one expose in `@o3r/schematics`, will be removed in Otter v12.
 * @param angularJsonString Content of angular.json file
 */
export function getPackageManager(angularJsonString?: string | null) {
  let packageManager = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
  if (angularJsonString) {
    const angularJsonObj = JSON.parse(angularJsonString) ;
    if (angularJsonObj?.cli?.packageManager) {
      packageManager = angularJsonObj.cli.packageManager;
    }
  }
  return packageManager;
}
