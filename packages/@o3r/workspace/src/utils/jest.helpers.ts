import { sync as globbySync } from 'globby';
import { existsSync } from 'node:fs';
import { posix, resolve } from 'node:path';

/**
 * Get the list of Jest Projects in the workspace
 * @param rootPackageJson Path to the root package.json
 * @param rootDir
 * @param jestConfigPattern Pattern to the jest config files
 * @returns list of Jest projects
 */
export const getJestProjects = (rootDir = process.cwd(), jestConfigPattern = 'jest.config.{j,t}s') => {
  const rootPackageJson = resolve(rootDir, 'package.json');
  if (!existsSync(rootPackageJson)) {
    console.warn(`No package.json found in ${rootDir}`);
    return [];
  }
  const jestConfigPatterns: string[] | undefined = require(rootPackageJson).workspaces?.map((packagePath: string) => posix.join(packagePath, jestConfigPattern));
  const jestConfigFileLists = jestConfigPatterns?.map((pattern) => globbySync(pattern, { cwd: rootDir }));
  return jestConfigFileLists
    ?.flat()
    .map((jestConfigFile) => posix.join('<rootDir>', jestConfigFile.replace(/jest\.config\.[jt]s$/, '')).replace(/\\+/g, '/'));
};
