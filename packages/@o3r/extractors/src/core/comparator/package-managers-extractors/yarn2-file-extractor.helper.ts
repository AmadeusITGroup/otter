import {
  join
} from 'node:path';
import {
  O3rCliError
} from '@o3r/schematics';
import {
  Cache,
  Configuration,
  Descriptor,
  FetchOptions,
  FetchResult,
  Locator,
  MinimalResolveOptions,
  MultiFetcher,
  Package,
  Project,
  ResolveOptions,
  Resolver,
  structUtils,
  ThrowReport
} from '@yarnpkg/core';
import {
  npath
} from '@yarnpkg/fslib';
import yarnNpmPlugin from '@yarnpkg/plugin-npm';

// Class copied from https://github.com/yarnpkg/berry/blob/master/packages/yarnpkg-core/sources/MultiResolver.ts
// because it is not exposed in @yarnpkg/core
export class MultiResolver implements Resolver {
  private readonly resolvers: Resolver[];

  constructor(resolvers: (Resolver | null)[]) {
    this.resolvers = resolvers.filter((resolver): resolver is Resolver => !!resolver);
  }

  private tryResolverByDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    const resolver = this.resolvers.find((r) => r.supportsDescriptor(descriptor, opts));

    if (!resolver) {
      return null;
    }

    return resolver;
  }

  private getResolverByDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    const resolver = this.resolvers.find((r) => r.supportsDescriptor(descriptor, opts));

    if (!resolver) {
      throw new Error(`${structUtils.prettyDescriptor(opts.project.configuration, descriptor)} isn't supported by any available resolver`);
    }

    return resolver;
  }

  private tryResolverByLocator(locator: Locator, opts: MinimalResolveOptions) {
    const resolver = this.resolvers.find((r) => r.supportsLocator(locator, opts));

    if (!resolver) {
      return null;
    }

    return resolver;
  }

  private getResolverByLocator(locator: Locator, opts: MinimalResolveOptions) {
    const resolver = this.resolvers.find((r) => r.supportsLocator(locator, opts));

    if (!resolver) {
      throw new Error(`${structUtils.prettyLocator(opts.project.configuration, locator)} isn't supported by any available resolver`);
    }

    return resolver;
  }

  public supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    const resolver = this.tryResolverByDescriptor(descriptor, opts);

    return !!resolver;
  }

  public supportsLocator(locator: Locator, opts: MinimalResolveOptions) {
    const resolver = this.tryResolverByLocator(locator, opts);

    return !!resolver;
  }

  public shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions) {
    const resolver = this.getResolverByLocator(locator, opts);

    return resolver.shouldPersistResolution(locator, opts);
  }

  public bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions) {
    const resolver = this.getResolverByDescriptor(descriptor, opts);

    return resolver.bindDescriptor(descriptor, fromLocator, opts);
  }

  public getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions) {
    const resolver = this.getResolverByDescriptor(descriptor, opts);

    return resolver.getResolutionDependencies(descriptor, opts);
  }

  public async getCandidates(descriptor: Descriptor, dependencies: Record<string, Package>, opts: ResolveOptions) {
    const resolver = this.getResolverByDescriptor(descriptor, opts);

    return await resolver.getCandidates(descriptor, dependencies, opts);
  }

  public async getSatisfying(descriptor: Descriptor, dependencies: Record<string, Package>, locators: Locator[], opts: ResolveOptions) {
    const resolver = this.getResolverByDescriptor(descriptor, opts);

    return resolver.getSatisfying(descriptor, dependencies, locators, opts);
  }

  public async resolve(locator: Locator, opts: ResolveOptions) {
    const resolver = this.getResolverByLocator(locator, opts);

    return await resolver.resolve(locator, opts);
  }
}

// TODO : how can we handle the yarn version discrepancy between user and package v?
// Test with different yarn major versions configured for wrks
async function getProject(cwd = process.cwd()) {
  const pluginConfiguration = {
    plugins: new Set(['plugin-npm']),
    modules: new Map([['plugin-npm', yarnNpmPlugin]])
  };
  const configuration = await Configuration.find(npath.toPortablePath(cwd), pluginConfiguration, { strict: false });
  if (!configuration.projectCwd) {
    throw new O3rCliError(`No project found from ${cwd}`);
  }
  // eslint-disable-next-line unicorn/no-array-method-this-argument -- false positive `Project.find` is not an array method
  const { project } = await Project.find(configuration, configuration.projectCwd);
  return project;
}

function getDescriptorFromReference(packageReference: string) {
  const descriptor = structUtils.tryParseDescriptor(packageReference);
  if (!descriptor) {
    throw new O3rCliError(`Invalid package descriptor ${packageReference}`);
  }
  return descriptor;
}

async function fetchPackage(project: Project, descriptor: Descriptor): Promise<FetchResult> {
  const cache = await Cache.find(project.configuration);
  const report = new ThrowReport();
  const multiResolver = new MultiResolver(
    (yarnNpmPlugin.resolvers || []).map((resolver) => new resolver())
  );
  const multiFetcher = new MultiFetcher(
    (yarnNpmPlugin.fetchers || []).map((fetcher) => new fetcher())
  );
  const fetchOptions: FetchOptions = { project, cache, checksums: project.storedChecksums, report, fetcher: multiFetcher };
  const resolveOptions: ResolveOptions = { project, report, resolver: multiResolver, fetchOptions };

  const normalizedDescriptor = project.configuration.normalizeDependency(descriptor);
  const candidate = await multiResolver.getCandidates(normalizedDescriptor, {}, resolveOptions);

  const descriptorStringify = `${descriptor.scope ? '@' + descriptor.scope : ''}/${descriptor.name}@${descriptor.range}`;
  if (candidate.length === 0) {
    throw new O3rCliError(`No candidate found for ${descriptorStringify}`);
  }
  const isSupported = multiFetcher.supports(candidate[0], fetchOptions);
  if (!isSupported) {
    throw new O3rCliError(`Fetcher does not support ${descriptorStringify}`);
  }
  return multiFetcher.fetch(candidate[0], resolveOptions.fetchOptions!);
}

/**
 * Retrieves the list of given files using yarn
 * from an npm package that is not present in the dependencies.
 * @param packageDescriptor Package descriptor using the npm semver format (i.e. @o3r/demo@^1.2.3)
 * @param paths Paths of the files to extract
 * @param cwd working directory
 */
export async function getFilesFromRegistry(packageDescriptor: string, paths: string[], cwd = process.cwd()): Promise<{ [key: string]: string }> {
  const project = await getProject(cwd);
  const descriptor = getDescriptorFromReference(packageDescriptor);
  const result = await fetchPackage(project, descriptor);
  const extractedFiles = paths.reduce((acc: Record<string, string>, path) => {
    const portablePath = npath.toPortablePath(join(result.prefixPath, path));
    if (result.packageFs.existsSync(portablePath)) {
      acc[path] = result.packageFs.readFileSync(portablePath, 'utf8');
    }
    return acc;
  }, {});
  if (result.releaseFs) {
    result.releaseFs();
  }
  return extractedFiles;
}
