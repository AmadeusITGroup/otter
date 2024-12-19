import {
  getPeerDepWithPattern,
} from './matching-peers';

describe('getPeerDepWithPattern', () => {
  test('should return peer dependency', () => {
    const pck = {
      name: 'test',
      version: '0.0.0-test',
      peerDependencies: {
        testPackage: '~1.2.3'
      }
    };

    const peerDeps = getPeerDepWithPattern('any-path.json', ['testPackage'], jest.fn().mockImplementation(() => JSON.stringify(pck)));
    expect(peerDeps.matchingPackagesVersions).toEqual({ testPackage: '~1.2.3' });
  });

  test('should default to o3r peer dependency', () => {
    const pck = {
      name: 'test',
      version: '0.0.0-test',
      peerDependencies: {
        '@o3r/test': '~1.2.3'
      }
    };

    const peerDeps = getPeerDepWithPattern('any-path.json', undefined, jest.fn().mockImplementation(() => JSON.stringify(pck)));
    expect(peerDeps.matchingPackagesVersions).toEqual({ '@o3r/test': '~1.2.3' });
  });

  test('should ignore peer dependency when optional', () => {
    const pck = {
      name: 'test',
      version: '0.0.0-test',
      peerDependencies: {
        testPackage: '~1.2.3'
      },
      peerDependenciesMeta: {
        testPackage: {
          optional: true
        }
      }
    };

    const peerDeps = getPeerDepWithPattern('any-path.json', ['testPackage'], jest.fn().mockImplementation(() => JSON.stringify(pck)));
    expect(peerDeps.matchingPackagesVersions).toEqual({});
  });

  test('should return generator dependency if found', () => {
    const pck = {
      name: 'test',
      version: '0.0.0-test',
      peerDependencies: {
        testPackage: '~1.2.3'
      },
      generatorDependencies: {
        testPackage: '~3.2.1'
      }
    };

    const peerDeps = getPeerDepWithPattern('any-path.json', ['testPackage'], jest.fn().mockImplementation(() => JSON.stringify(pck)));
    expect(peerDeps.matchingPackagesVersions).toEqual({ testPackage: '~3.2.1' });
  });
});
