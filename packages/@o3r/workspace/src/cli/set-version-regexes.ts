/**
 * Escapes special regex characters in a string to create a literal match pattern.
 * @param str - The string to escape (e.g., "0.0.0(-placeholder)?")
 * @returns The escaped string safe for use inside a RegExp constructor
 */
export function escapeForRegex(str: string): string {
  return str.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&');
}

/**
 * Creates a regex to match placeholder versions (e.g., "0.0.0", "0.0.0-placeholder")
 * @param placeholder - The placeholder pattern (default: "0.0.0(-placeholder)?")
 * @returns RegExp that captures the version prefix (~, ^) in $1
 */
export function createPlaceholderRegex(placeholder: string): RegExp {
  return new RegExp('"([~^]?)' + escapeForRegex(placeholder) + '"', 'g');
}

/**
 * Regex to match workspace protocol versions (e.g., "workspace:*", "workspace:~1.0.0")
 * Captures: $1 = prefix (~, ^, or *), $2 = trailing comma if present
 */
export const workspaceProtocolRegex = /"workspace:([~^*]?)[^"]*"(,?)$/gm;

/**
 * Regex to match wildcard versions (e.g., "*1.2.3", "*1.0.0-rc.1")
 * Captures: $1 = version (semver format), $2 = trailing comma if present
 * Note: Only matches versions starting with digits to avoid matching glob patterns like "*.js" or "**.metadata.json"
 */
export const wildcardVersionRegex = /"\*([0-9]+\.[0-9]+\.[0-9]+[^"]*)"(,?)$/gm;

/**
 * Regex to match and remove "private": true field from package.json
 */
export const privateFieldRegex = /^\s*"private"\s*:\s*true\s*,?$/gm;
