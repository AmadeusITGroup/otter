import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  posix,
  resolve,
} from 'node:path';
import {
  sync as globbySync,
} from 'globby';

/**
 * Get the list of Jest Projects in the workspace
 * @param rootDir Path to the root
 * @param jestConfigPattern Pattern to the jest config files
 * @returns list of Jest projects
 */
export const getJestProjects = (rootDir = process.cwd(), jestConfigPattern = 'jest.config.{j,t}s') => {
  const rootPackageJson = resolve(rootDir, 'package.json');
  if (!existsSync(rootPackageJson)) {
    // eslint-disable-next-line no-console -- no other logger available
    console.warn(`No package.json found in ${rootDir}`);
    return [];
  }
  const jestConfigPatterns: string[] | undefined = JSON.parse(readFileSync(rootPackageJson, { encoding: 'utf8' })).workspaces?.map((packagePath: string) => posix.join(packagePath, jestConfigPattern));
  const jestConfigFileLists = jestConfigPatterns?.map((pattern) => globbySync(pattern, { cwd: rootDir }));
  return jestConfigFileLists
    ?.flat()
    .map((jestConfigFile) => posix.join('<rootDir>', jestConfigFile.replace(/jest\.config\.[jt]s$/, '')).replace(/\\+/g, '/'));
};
