import { Cache, Configuration, Descriptor, FetchOptions, FetchResult, Locator, Project, ResolveOptions, structUtils, ThrowReport } from '@yarnpkg/core';
import { npath, PortablePath } from '@yarnpkg/fslib';
import * as npmPlugin from '@yarnpkg/plugin-npm';
import { join } from 'node:path';
import { O3rCliError } from '@o3r/schematics';

// TODO : how can we handle the yarn version discrepancy between user and package v?
// Test with different yarn major versions configured for wrks
async function getProject(cwd = process.cwd()): Promise<Project> {
  const pluginConfiguration = {
    plugins: new Set(['plugin-npm']),
    modules: new Map([['plugin-npm', npmPlugin.default]])
  };
  const configuration = await Configuration.find(npath.toPortablePath(cwd), pluginConfiguration, { strict: false });
  if (!configuration.projectCwd) {
    throw new O3rCliError(`No project found from ${cwd}`);
  }
  const { project } = await Project.find(configuration, configuration.projectCwd);
  return project;
}

function getDescriptorFromReference(packageReference: string): Descriptor {
  const descriptor = structUtils.tryParseDescriptor(packageReference);
  if (!descriptor) {
    throw new O3rCliError(`Invalid package descriptor ${packageReference}`);
  }
  return descriptor;
}

async function fetchPackage(project: Project, descriptor: Descriptor): Promise<FetchResult> {
  const cache = await Cache.find(project.configuration);
  const report = new ThrowReport();
  const resolver = project.configuration.makeResolver();
  const fetcher = project.configuration.makeFetcher();
  const fetchOptions: FetchOptions = { project, cache, checksums: project.storedChecksums, report, fetcher };
  const resolveOptions: ResolveOptions = { project, report, resolver, fetchOptions };

  const normalizedDescriptor = project.configuration.normalizeDependency(descriptor);
  const candidate = await resolver.getCandidates(normalizedDescriptor, {}, resolveOptions);

  const descriptorStringify = `${descriptor.scope ? '@' + descriptor.scope : ''}/${descriptor.name}@${descriptor.range}`;
  if (candidate.length === 0) {
    throw new O3rCliError(`No candidate found for ${descriptorStringify}`);
  }
  const isSupported = fetcher.supports(candidate[0], fetchOptions);
  if (!isSupported) {
    throw new O3rCliError(`Fetcher does not support ${descriptorStringify}`);
  }
  return fetcher.fetch(candidate[0], resolveOptions.fetchOptions!);
}

function getRelativePathInCache(locator: Locator | Descriptor, path: string): PortablePath {
  const cachePath = join('./node_modules', locator.scope ? '@' + locator.scope : '', locator.name, path);
  return npath.toPortablePath(cachePath);
}

/**
 * Retrieves the list of given files from an npm package using yarn.
 * @param packageDescriptor Package descriptor using the npm semver format (i.e. @o3r/demo@^1.2.3)
 * @param paths Paths of the files to extract
 * @param cwd working directory
 */
export async function getFilesYarn(packageDescriptor: string, paths: string[], cwd = process.cwd()): Promise<{ [key: string]: string }> {
  const project = await getProject(cwd);
  const descriptor = getDescriptorFromReference(packageDescriptor);
  const result = await fetchPackage(project, descriptor);
  const extractedFiles = paths.reduce((filesContent, path) => {
    filesContent[path] = result.packageFs.readFileSync(getRelativePathInCache(descriptor, path)).toString();
    return filesContent;
  }, {} as { [key: string]: string });
  if (result.releaseFs) {
    result.releaseFs();
  }
  return extractedFiles;
}
