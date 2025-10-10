import {
  posix,
} from 'node:path';
import type {
  Logger,
} from '../logger.mjs';
import {
  isAuthBasic,
  isAuthToken,
  type ManifestAuth,
  type Registry,
} from '../manifest/manifest-auth.mjs';
import {
  isDependencyArtifact,
  isDependencyLink,
  type Dependency,
  type Model,
} from '../manifest/manifest.mjs';

/**
 * Get authentication headers from registry configuration
 * @param option
 */
const getAuthHeaders = (option: Registry): Record<string, string> => {
  if (isAuthToken(option)) {
    return { Authorization: `Basic ${option.authToken}` };
  } else if (isAuthBasic(option)) {
    const auth = Buffer.from(`${option.user || ''}:${option.password}`).toString('base64');
    return { Authorization: `Basic ${auth}` };
  }
  return {};
};

/**
 * Get the dependency URL
 * @param dependency
 * @param model
 */
const getDependencyUrl = (dependency: Dependency, model?: Model) => {
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
  /** Function to get the dependency URL */
  getUrl?: (dependency: Dependency, model?: Model) => string;
  /** Function to get authentication headers from registry configuration */
  getHeaders?: (option: Registry) => Record<string, string>;
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
export const downloadDependencyModels = (dependency: Dependency, manifestAuth: ManifestAuth, options?: DownloadDependencyModelsOptions) => {
  const { getUrl = getDependencyUrl, getHeaders = getAuthHeaders, logger } = options || {};
  const registry = manifestAuth.registries.find(({ url }) => isDependencyArtifact(dependency) ? url === dependency.registry : dependency.link.startsWith(url));
  const headers = registry ? getHeaders(registry) : undefined;
  const fetchOptions = {
    method: 'GET',
    headers
  };

  return (isDependencyLink(dependency) ? [undefined] : dependency.models)
    .map(async (model) => {
      const url = getUrl(dependency, model);
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        logger?.error(`Failed to download file: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      return {
        url,
        dependency,
        model,
        content
      };
    });
};
