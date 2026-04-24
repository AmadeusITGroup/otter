import {
  Locator,
  ResolveOptions,
  structUtils,
} from '@yarnpkg/core';
import {
  npmHttpUtils,
} from '@yarnpkg/plugin-npm';
import {
  CustomNpmSemverResolver,
} from './custom-npm-semver-resolver';

jest.mock('@yarnpkg/plugin-npm', () => {
  const actual = jest.requireActual('@yarnpkg/plugin-npm');
  return {
    ...actual,
    npmHttpUtils: {
      getPackageMetadata: jest.fn()
    },
    NpmSemverFetcher: {
      isConventionalTarballUrl: jest.fn().mockReturnValue(true)
    }
  };
});

describe('CustomNpmSemverResolver', () => {
  let resolver: CustomNpmSemverResolver;

  beforeEach(() => {
    resolver = new CustomNpmSemverResolver();
    jest.clearAllMocks();
  });

  it('should return candidates sorted in descending order', async () => {
    const descriptor = structUtils.makeDescriptor(
      structUtils.makeIdent(null, 'test-pkg'),
      'npm:^1.0.0'
    );

    (npmHttpUtils.getPackageMetadata as jest.Mock).mockResolvedValue({
      versions: {
        '1.0.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0.tgz' } },
        '1.2.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.2.0.tgz' } },
        '1.1.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.1.0.tgz' } },
        '2.0.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-2.0.0.tgz' } }
      }
    });

    const mockOpts = {
      project: { configuration: {} },
      fetchOptions: { cache: undefined }
    } as unknown as ResolveOptions;

    const candidates = await resolver.getCandidates(descriptor, {}, mockOpts);

    // Only ^1.0.0 matches: 1.0.0, 1.1.0, 1.2.0 (not 2.0.0)
    // Should be sorted descending: 1.2.0, 1.1.0, 1.0.0
    expect(candidates).toHaveLength(3);
    const versions = candidates.map((c: Locator) => structUtils.parseLocator(structUtils.stringifyLocator(c)).reference.replace('npm:', ''));
    expect(versions).toEqual(['1.2.0', '1.1.0', '1.0.0']);
  });

  it('should include prerelease versions', async () => {
    const descriptor = structUtils.makeDescriptor(
      structUtils.makeIdent(null, 'test-pkg'),
      'npm:>=1.0.0-alpha.0'
    );

    (npmHttpUtils.getPackageMetadata as jest.Mock).mockResolvedValue({
      versions: {
        '1.0.0-alpha.1': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0-alpha.1.tgz' } },
        '1.0.0-alpha.2': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0-alpha.2.tgz' } },
        '1.0.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0.tgz' } }
      }
    });

    const mockOpts = {
      project: { configuration: {} },
      fetchOptions: { cache: undefined }
    } as unknown as ResolveOptions;

    const candidates = await resolver.getCandidates(descriptor, {}, mockOpts);

    // All 3 should match with includePrerelease, sorted desc
    expect(candidates).toHaveLength(3);
  });

  it('should filter out deprecated versions if non-deprecated exist', async () => {
    const descriptor = structUtils.makeDescriptor(
      structUtils.makeIdent(null, 'test-pkg'),
      'npm:^1.0.0'
    );

    (npmHttpUtils.getPackageMetadata as jest.Mock).mockResolvedValue({
      versions: {
        '1.0.0': { deprecated: 'old', dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0.tgz' } },
        '1.1.0': { dist: { tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.1.0.tgz' } }
      }
    });

    const mockOpts = {
      project: { configuration: {} },
      fetchOptions: { cache: undefined }
    } as unknown as ResolveOptions;

    const candidates = await resolver.getCandidates(descriptor, {}, mockOpts);

    expect(candidates).toHaveLength(1);
  });
});
