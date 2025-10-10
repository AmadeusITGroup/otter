import { type Dependency, type DependencyLink, type Logger, type ManifestAuth } from "../public_api.mjs";
import { getAuthHeaders } from "./auth-headers.mjs";

/**
 * Options for downloading dependency links
 */
export interface DownloadDependencyLinkOptions {
  /** Logger for logging messages */
  logger?: Logger;
}

interface RetrievedDependency {
  url: string;
  content: string;
  dependency: Dependency;
}

/**
 * Adapt URL to change well known endpoints to CI friendly URLs
 * @param url
 * @returns
 */
const adaptUrl = (url: string) => {
  return url
    .replace(/^https:\/\/([a-z0-9]*)github.com\/(.*)\/raw\/(.*)$/i, 'https://raw.githubusercontent.com/$2/$3')
}

/**
 * Download models from the dependency artifact
 * @param dependency
 * @param manifestAuth
 * @param options
 * @returns
 */
export const downloadDependencyLink = (dependency: DependencyLink, manifestAuth: ManifestAuth, options?: DownloadDependencyLinkOptions) => {
  const { logger } = options || {};
  const registry = manifestAuth.registries
    .find(({ url }) => dependency.link.startsWith(url));
  const url = dependency.link;
  const headers = registry ? getAuthHeaders(registry) : undefined;
  const fetchOptions = {
    method: 'GET',
    headers
  };

  return [
    new Promise<RetrievedDependency>(async (resolve, reject) => {
      try {
        const fetchUrl = adaptUrl(dependency.link);
        logger?.debug?.(`Retrieving artifact at ${fetchUrl}`);
        const response = await fetch(fetchUrl, fetchOptions);
        const content = await response.text();

        if (!response.ok) {
          throw new Error(`Failed to download file at ${url}: ${response.status} ${response.statusText}`);
        }

        resolve({
          url,
          dependency,
          content
        });
      } catch (e) {
        logger?.error(`Failed to download file at ${url}`);
        reject(e);
      }
    })
  ];
};
