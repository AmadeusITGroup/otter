/**
 * A registry to store resources in memory and retrieve them by their URI.
 * key: resource URI
 * value: resource content
 */
export const resourceRegistry = new Map<string, string>();

export interface ResourceToolOptions {
  /**
   * Prefix for resource URIs managed by the tool.
   */
  uriPrefix: string;
}
