import {
  readFileSync,
  writeFileSync,
} from 'node:fs';

/**
 * Add dependencies to package.json files
 * @param folders folder containing package.json files
 * @param dependencyName Name of the dependency to add
 * @param dependencyRange Range of the dependency to add
 * @param type Type of the dependency to add
 */
export const addDependenciesToPackageJson = (folders: string[], dependencyName: string, dependencyRange: string, type: 'dependencies' | 'devDependencies' | 'peerDependencies') => {
  folders.forEach((folder) => {
    const packageJsonPath = `${folder}/package.json`;
    const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }));
    (packageJson[type] ||= {})[dependencyName] = dependencyRange;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  });
};

/**
 * Pin `@yarnpkg/core` in the `resolutions` of the workspace root package.json.
 * `@yarnpkg/core@4.9.2` cannot be installed, and it is pulled by the direct dependency of `@yarnpkg/cli` on `@yarnpkg/core@^4.9.1`.
 * TODO: remove once https://github.com/yarnpkg/berry/issues/7281 is fixed
 * @param workspacePath Path to the folder containing the workspace root package.json
 */
export const pinYarnCoreResolution = (workspacePath: string) => {
  const packageJsonPath = `${workspacePath}/package.json`;
  const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }));
  packageJson.resolutions = { ...packageJson.resolutions, '@yarnpkg/core': '4.9.1' };
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};
