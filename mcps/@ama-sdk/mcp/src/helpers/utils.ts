import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  join,
} from 'node:path';
import type {
  Logger,
} from '@ama-mcp/core';

/** URI prefix for SDK context resources */
const RESOURCE_URI_PREFIX = 'sdk-context';

/** Pattern for valid npm package names (scoped and unscoped) - must be lowercase per npm spec */
const VALID_PACKAGE_NAME_PATTERN = /^(@[a-z\d][\w.-]*\/)?[a-z\d][\w.-]*$/;

/**
 * Validates that a package name is safe and follows npm naming conventions.
 * Prevents path traversal attacks and ensures the name is a valid npm package.
 * @param packageName The package name to validate
 * @returns true if the package name is valid and safe
 */
export const isValidPackageName = (packageName: string): boolean =>
  Boolean(packageName)
  && typeof packageName === 'string'
  && VALID_PACKAGE_NAME_PATTERN.test(packageName);

/**
 * Load SDK packages list from package.json
 * @param projectPath Path to project root
 * @param logger Optional logger for debug output
 * @returns Array of package names configured in sdkContext.packages
 */
export const loadSdkPackagesFromPackageJson = (projectPath: string, logger?: Logger): string[] => {
  const packageJsonPath = join(projectPath, 'package.json');
  if (!existsSync(packageJsonPath)) {
    logger?.debug?.(`No package.json found at ${packageJsonPath}`);
    return [];
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { sdkContext?: { packages?: string[] } };
    return (packageJson.sdkContext?.packages ?? []).filter((pkg) => {
      const valid = isValidPackageName(pkg);
      if (!valid) {
        logger?.warn?.(`Invalid package name in sdkContext.packages: "${pkg}", skipping`);
      }
      return valid;
    });
  } catch (error) {
    logger?.error?.(`Failed to parse package.json at ${packageJsonPath}:`, error);
    return [];
  }
};

/**
 * Generates a safe URI from a package name
 * @param packageName The npm package name
 * @returns A URI-safe identifier
 */
export const generateUri = (packageName: string): string =>
  `${RESOURCE_URI_PREFIX}://${packageName.replace(/[^a-z0-9.]/gi, '-')}`;
