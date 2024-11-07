import {
  Descriptor,
  miscUtils,
  Package,
  ResolveOptions,
  structUtils
} from '@yarnpkg/core';
import {
  npmHttpUtils,
  NpmSemverFetcher,
  NpmSemverResolver
} from '@yarnpkg/plugin-npm';
import {
  Range,
  SemVer,
  valid
} from 'semver';

/**
 * Unexposed constant from yarn https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm/sources/constants.ts
 */
const PROTOCOL = `npm:`;

/**
 * Extends NpmSeverResolver to support prerelease tags
 * Check original code from https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm/sources/NpmSemverResolver.ts
 */
export class CustomNpmSemverResolver extends NpmSemverResolver {
  /** @inheritDoc */
  public override async getCandidates(descriptor: Descriptor, _dependencies: Record<string, Package>, opts: ResolveOptions) {
    const range = new Range(descriptor.range.slice(PROTOCOL.length), { includePrerelease: true });
    const registryData = await npmHttpUtils.getPackageMetadata(descriptor, {
      cache: opts.fetchOptions?.cache,
      project: opts.project,
      version: valid(range.raw) ? range.raw : undefined
    });

    const candidates = miscUtils.mapAndFilter(Object.keys(registryData.versions), (version) => {
      try {
        const candidate = new SemVer(version, { includePrerelease: true });
        if (range.test(candidate)) {
          return candidate;
        }
      } catch {}

      return miscUtils.mapAndFilter.skip;
    });

    const noDeprecatedCandidates = candidates.filter((version) => !registryData.versions[version.raw].deprecated);

    // If there are versions that aren't deprecated, use them
    const finalCandidates = noDeprecatedCandidates.length > 0
      ? noDeprecatedCandidates
      : candidates;

    finalCandidates.sort((a, b) => -a.compare(b));

    return finalCandidates.map((version) => {
      const versionLocator = structUtils.makeLocator(descriptor, `${PROTOCOL}${version.raw}`);
      const archiveUrl = registryData.versions[version.raw].dist.tarball;

      return NpmSemverFetcher.isConventionalTarballUrl(versionLocator, archiveUrl, { configuration: opts.project.configuration })
        ? versionLocator
        : structUtils.bindLocator(versionLocator, { __archiveUrl: archiveUrl });
    });
  }
}
