import {
  getJestModuleNameMapper as workspaceGetJestModuleNameMapper,
  getJestProjects as workspaceGetJestProjects
} from '@o3r/workspace';

/**
 * Get the list of Jest Projects in the workspace
 * @deprecated Please use the one exposed in `@o3r/workspace`, will be removed in Otter v12.
 * @param rootPackageJson Path to the root package.json
 * @param rootDir
 * @param jestConfigPattern Pattern to the jest config files
 * @returns list of Jest projects
 */
export const getJestProjects = workspaceGetJestProjects;

/**
 * Get the list of modules mapping
 * @deprecated Please use the one exposed in `@o3r/workspace`, will be removed in Otter v12.
 * @param rootDir Root directory of the jest project
 * @param testingTsconfigPath Path to the tsconfig.json used for test mapping files
 * @returns
 */
export const getJestModuleNameMapper = workspaceGetJestModuleNameMapper;
