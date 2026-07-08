import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  dirname,
  join,
} from 'node:path';
import type {
  Logger,
} from '@ama-mcp/core';
import {
  generateUri,
  isValidPackageName,
} from './utils';

/**
 * Information about a loaded SDK context
 */
export interface SdkContextInfo {
  /** The npm package name */
  packageName: string;
  /** The content of the SDK_CONTEXT.md file */
  content: string;
  /** The resource URI for this context */
  uri: string;
}

/**
 * Try to load SDK context for a single package using Node's module resolution
 * @param packageName Package name to load
 * @param contextFileName Name of the context file to load
 * @param logger Optional logger for debug output
 * @returns SDK context info or null if not found/invalid
 */
const tryLoadSdkContext = (
  packageName: string,
  contextFileName: string,
  logger?: Logger
): SdkContextInfo | null => {
  if (!isValidPackageName(packageName)) {
    logger?.warn?.(`Skipping invalid package name: "${packageName}"`);
    return null;
  }

  let packagePath: string | null = null;

  // Try to resolve using Node's module resolution
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`, { paths: [process.cwd()] });
    packagePath = dirname(packageJsonPath);
    logger?.debug?.(`Resolved ${packageName} using require.resolve: ${packagePath}`);
  } catch {
    logger?.warn?.(`Package "${packageName}" not found. Is it installed?`);
    return null;
  }

  const contextPath = join(packagePath, contextFileName);
  if (!existsSync(contextPath)) {
    logger?.debug?.(`No SDK_CONTEXT.md found for ${packageName} at ${contextPath}`);
    return null;
  }

  try {
    const content = readFileSync(contextPath, 'utf8');
    logger?.debug?.(`Loaded SDK context for ${packageName}`);
    return { packageName, content, uri: generateUri(packageName) };
  } catch (error) {
    logger?.error?.(`Failed to read SDK context for ${packageName}:`, error);
    return null;
  }
};

/**
 * Load SDK contexts from explicitly configured packages
 * @param sdkPackages List of package names to load
 * @param contextFileName Name of the context file to load
 * @param logger Optional logger for debug output
 * @returns Array of loaded SDK context information
 */
export const loadSdkContexts = (sdkPackages: string[], contextFileName: string, logger?: Logger): SdkContextInfo[] =>
  sdkPackages
    .map((pkg) => tryLoadSdkContext(pkg, contextFileName, logger))
    .filter((ctx): ctx is SdkContextInfo => ctx !== null);
