import {
  posix,
} from 'node:path';
import type {
  Logger,
} from '../logger.mjs';
import {
  type ManifestAuth,
} from '../manifest/manifest-auth.mjs';
import {
  isDependencyLink,
  type Dependency,
  type DependencyArtifact,
  type Model,
} from '../manifest/manifest.mjs';
import { getAuthHeaders } from './auth-headers.mjs';

/**
 * Get the dependency URL
 * @param dependency
 * @param model
 */
const getUrl = (dependency: Dependency, model?: Model) => {
  if (isDependencyLink(dependency)) {
    return dependency.link;
  }

  const url = new URL(dependency.registry || '');
  url.pathname = posix.join(url.pathname, dependency.artifact?.replaceAll('.', posix.delimiter) || '', dependency.version, model?.source || '');
  return url.toString();
};

/**
 * Options for downloading dependency models
 */
export interface DownloadDependencyModelsOptions {
  /** Logger for logging messages */
  logger?: Logger;
}

/**
 * Download models from the dependency artifact
 * @param dependency
 * @param manifestAuth
 * @param options
 * @returns
 */
export const downloadDependencyModels = (dependency: DependencyArtifact, manifestAuth: ManifestAuth, options?: DownloadDependencyModelsOptions) => {
  const { logger } = options || {};
  const registry = manifestAuth.registries.find(({ url }) => url === dependency.registry);
  const headers = registry ? getAuthHeaders(registry) : undefined;
  const fetchOptions = {
    method: 'GET',
    headers
  };

  return dependency.models
    .map(async (model) => {
      const url = getUrl(dependency, model);

      try {
        logger?.debug?.(`Retrieving artifact at ${url}`);
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`Failed to download file at ${url}: ${response.status} ${response.statusText}`);
        }

        const content = await response.text();
        return {
          url,
          dependency,
          model,
          content
        };
      } catch (e) {
        logger?.error(`Failed to download file at ${url}`);
        throw e;
      }
    });
};
