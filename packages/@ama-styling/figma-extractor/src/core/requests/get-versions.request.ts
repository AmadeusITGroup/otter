import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  FilesApi,
  ProjectsApi,
  type Version,
} from '@ama-styling/figma-sdk';
import {
  coerce,
  compare,
  intersects,
  satisfies,
  valid,
} from 'semver';
import type {
  FigmaFileContext,
  FigmaProjectContext,
} from '../interfaces';

/** Default of the {@link MajorVersionsOptions.fileNameMatcher | Filename matcher} to retrieve versions  */
export const DEFAULT_FILENAME_MATCHER = 'v((?:[0-9]+\\.){0,2}[0-9]+(?:-[^ ]+)?)$';

/** Default {@link VersionsOptions.numberOfVersions | number of version} to retrieve */
export const DEFAULT_VERSION_NUMBER = 1000;

/** Options to {@link getVersions} */
export interface VersionsOptions extends FigmaFileContext {
  /**
   * Number of history to download (default: {@link DEFAULT_VERSION_NUMBER})
   * @default 1000
   */
  numberOfVersions?: number;

  /** Range to filter the versions */
  versionRange?: string;
}

/** Options to {@link getAvailableMajorVersions} */
export interface MajorVersionsOptions extends FigmaProjectContext {
  /**
   * Regex to match the file name and capture the version (default: {@link DEFAULT_FILENAME_MATCHER})
   * @default 'v((?:[0-9]+\\.){0,2}[0-9]+(?:-[^ ]+)?)$'
   */
  fileNameMatcher?: string;

  /** Range to filter the versions */
  versionRange?: string;
}

export type VersionWithFileKey = Version & { fileKey: string };

/**
 * Get the Version available in the history
 * @param apiClient SDK Api Client
 * @param options
 */
export const getFileVersions = async (apiClient: ApiClient, options: VersionsOptions): Promise<VersionWithFileKey[]> => {
  const filesApi = new FilesApi(apiClient);
  options.logger?.debug?.('Initialize request to retrieve Figma file versions');
  const versionResponse = await filesApi.getFileVersions({ file_key: options.fileKey, page_size: options.numberOfVersions || DEFAULT_VERSION_NUMBER });
  options.logger?.debug?.('Listed Figma file versions');

  return versionResponse.versions
    .filter((version) => {
      if (version.label && !valid(version.label)) {
        options.logger?.warn?.(`Invalid version label: "${version.label}"`);
        return false;
      }

      if (version.label && options.versionRange && !satisfies(version.label, options.versionRange)) {
        options.logger?.debug?.(`The version "${version.label}" does not matching the given range: "${options.versionRange}"`);
        return false;
      }

      return !!version.label;
    })
    .map((version): Version & { fileKey: string } => ({
      ...version,
      label: coerce(version.label)!.toString(),
      fileKey: options.fileKey
    }))
    .sort((a, b) => -compare(a.label, b.label));
};

/**
 * Retrieve the available major versions and the associated file from a Figma project
 * @param apiClient SDK Api Client
 * @param options
 */
export const getAvailableMajorVersions = async (apiClient: ApiClient, options: MajorVersionsOptions) => {
  const fileNameMatcher = new RegExp(options.fileNameMatcher || DEFAULT_FILENAME_MATCHER);
  const projectsApi = new ProjectsApi(apiClient);
  options.logger?.debug?.('Initialize request to retrieve Figma files from project');
  const filesResponse = await projectsApi.getProjectFiles({ project_id: options.projectKey });
  options.logger?.debug?.('Listed Figma files from project');

  return filesResponse.files
    .reduce((acc, file) => {
      const fileMatch = fileNameMatcher.exec(file.name);
      if (!fileMatch) {
        options.logger?.debug?.(`File "${file.name}" does not match the file name matcher "${fileNameMatcher}"`);
        return acc;
      }
      const version = coerce(fileMatch[1])?.version;
      if (!version || !valid(version)) {
        options.logger?.warn?.(`File "${file.name}" does not have a valid version: "${fileMatch[1]}"`);
        return acc;
      }

      const range = version.replaceAll(/\.0/g, '.*');
      if (options.versionRange && !intersects(`${range}`, options.versionRange)) {
        options.logger?.info?.(`File "${file.name}" does not matching the given range: "${options.versionRange}"`);
        return acc;
      }

      acc.push({
        range,
        version,
        file
      });
      return acc;
    }, [] as { version: string; range: string; file: (typeof filesResponse.files)[0] }[])
    .sort((a, b) => -compare(a.version, b.version));
};

/**
 * Get all versions from a targeted project
 * @param apiClient SDK Api Client
 * @param options
 */
export const getAllVersions = async (apiClient: ApiClient, options: MajorVersionsOptions) => {
  const versions = await getAvailableMajorVersions(apiClient, options);
  const fullVersionsMap = versions.map((version) =>
    getFileVersions(apiClient, {
      ...options,
      versionRange: version.range,
      fileKey: version.file.key
    }));
  return (await Promise.all(fullVersionsMap))
    .flat()
    .sort((a, b) => -compare(a.label, b.label));
};
