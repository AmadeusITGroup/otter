
import * as commentJson from 'comment-json';

/**
 * Get package manager used in runs
 * Defaults to the package manager setup in process.env if no package manager set in angular.json
 *
 * @param angularJsonString Content of angular.json file
 */
export function getPackageManager(angularJsonString?: string | null) {
  let packageManager = process.env && process.env.npm_execpath && process.env.npm_execpath.indexOf('yarn') === -1 ? 'npm' : 'yarn';
  if (angularJsonString) {
    const angularJsonObj = commentJson.parse(angularJsonString) as any;
    if (angularJsonObj?.cli?.packageManager) {
      packageManager = angularJsonObj.cli.packageManager;
    }
  }
  return packageManager;
}
