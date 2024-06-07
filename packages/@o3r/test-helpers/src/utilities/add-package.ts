import { readFileSync, writeFileSync } from 'node:fs';

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
    const packageJson = JSON.parse(readFileSync(packageJsonPath, {encoding: 'utf8'}));
    (packageJson[type] ||= {})[dependencyName] = dependencyRange;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  });
};
