import {
  join,
} from 'node:path';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  enforceTildeRange,
  getDependencyMaximumVersionRange,
  getExternalDependenciesInfo,
  isDependencyAlreadyInstalled,
  isRangeGreater,
} from './dependencies';

describe('enforceTildeRange', () => {
  test('should change caret range', () => {
    expect(enforceTildeRange('^1.2.3')).toBe('~1.2.3');
  });

  test('should change caret handle undefined', () => {
    expect(enforceTildeRange()).not.toBeDefined();
  });

  test('should not change pint range', () => {
    expect(enforceTildeRange('1.2.3')).toBe('1.2.3');
  });

  test('should change multi caret range', () => {
    expect(enforceTildeRange('^1.2.3 | 1.0.0 | ^1.1.0')).toBe('~1.2.3 | 1.0.0 | ~1.1.0');
  });
});

describe('getDependencyMaximumVersionRange', () => {
  test('should return undefined if the dependency does not exist in the package.json', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {},
      devDependencies: {}
    }, true)
    ).toBe(undefined);
  });

  test('should return the widest range if the range in the package.json intersect', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {
        'ultimate-library': '~12.6.0'
      },
      peerDependencies: {
        'ultimate-library': '^12.3.0'
      },
      devDependencies: {
        'ultimate-library': '12.6.10'
      }
    }, false)
    ).toBe('^12.3.0');
  });

  test('should transform all the ^ into ~ if the enforce tilde flag is enforce', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {
        'ultimate-library': '12.5.8'
      },
      peerDependencies: {
        'ultimate-library': '^12.3.0'
      },
      devDependencies: {
        'ultimate-library': '~12.5.0'
      }
    }, true)
    ).toBe('~12.5.0');
  });

  test('should return the highest range if the ranges in the package.json do not intersect', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {
        'ultimate-library': '~12.6.0'
      },
      peerDependencies: {
        'ultimate-library': '~11.3.0'
      },
      devDependencies: {
        'ultimate-library': '~12.1.0'
      }
    }, false)
    ).toBe('~12.6.0');
  });

  test('should ignore invalid ranges', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {
        'ultimate-library': 'invalid-range'
      },
      peerDependencies: {
        'ultimate-library': '~12.1.0'
      }
    })).toBe('~12.1.0');
  });

  test('should consider the released version if a matching prerelease exists', () => {
    expect(getDependencyMaximumVersionRange('ultimate-library', {
      dependencies: {
        'ultimate-library': '~13.12.0-invalid-range.8'
      },
      devDependencies: {
        'ultimate-library': '~13.12.0-invalid-range.8'
      },
      peerDependencies: {
        'ultimate-library': '~13.12.0'
      }
    })).toBe('~13.12.0');
  });
});

describe('isDependencyAlreadyInstalled', () => {
  it('should return true if a dependency matching the range is in the packageJson dependendencies', () => {
    expect(isDependencyAlreadyInstalled(
      'ultimate-package', {
        dependencies: {
          'ultimate-package': '~18.3.2'
        }
      }, {
        range: '~18.3.0',
        types: [NodeDependencyType.Default, NodeDependencyType.Peer]
      })).toBe(true);
  });
  it('should support pre-release', () => {
    expect(isDependencyAlreadyInstalled('abc', {
      dependencies: {
        abc: '~18.3.0-rc.0'
      }
    }, {
      range: '^18.3.0',
      types: [NodeDependencyType.Default]
    })).toBe(false);
    expect(isDependencyAlreadyInstalled('abc', {
      dependencies: {
        abc: '~18.3.0-rc.0'
      }
    }, {
      range: '^18.2.0',
      types: [NodeDependencyType.Default]
    })).toBe(true);
    expect(isDependencyAlreadyInstalled('abc', {
      dependencies: {
        abc: '^18.3.0'
      }
    }, {
      range: '~18.4.0-rc.0',
      types: [NodeDependencyType.Default]
    })).toBe(false);
    expect(isDependencyAlreadyInstalled('abc', {
      dependencies: {
        abc: '~18.3.0'
      }
    }, {
      range: '^18.3.0-rc.0',
      types: [NodeDependencyType.Default]
    })).toBe(true);
  });
  it('should return false if a dependency not matching the range is in the packageJson dependencies', () => {
    expect(isDependencyAlreadyInstalled('ultimate-package', {
      dependencies: {
        'ultimate-package': '17.2.1'
      }
    }, {
      range: '~18.0.2',
      types: [NodeDependencyType.Default, NodeDependencyType.Peer]
    })).toBe(false);
  });
  it('should return false if a matching dependency is found in the incorrect dependency type', () => {
    expect(isDependencyAlreadyInstalled(
      'ultimate-package', {
        dependencies: {
          'ultimate-package': '~18.0.2'
        }
      }, {
        range: '~18.0.2',
        types: [NodeDependencyType.Dev]
      })).toBe(false);
  });
  it('should return false if the package is not part of the dependencies', () => {
    expect(isDependencyAlreadyInstalled(
      'ultimate-package', {
        dependencies: {},
        devDependencies: {},
        peerDependencies: {}
      }, {
        range: '~18.0.2',
        types: [NodeDependencyType.Dev]
      })).toBe(false);
  });
});

describe('isRangeGreater', () => {
  it('should return the highest range if the ranges do not intersect', () => {
    expect(isRangeGreater('~12.6.0', '12.7.12')).toBe(false);
    expect(isRangeGreater('~12.6.0', '~12.7.0')).toBe(false);
    expect(isRangeGreater('~12.6.0', '~12.5.0')).toBe(true);
  });
  it('should return the widest range if they intersect', () => {
    expect(isRangeGreater('^12.6.0', '12.7.12')).toBe(true);
    expect(isRangeGreater('~12.6.0', '12.6.12')).toBe(true);
    expect(isRangeGreater('12.6.12', '~12.6.0')).toBe(false);
  });
  it('should return the released version if there is a prerelease', () => {
    expect(isRangeGreater('^12.6.0', '12.7.12-prerelease.4')).toBe(true);
    expect(isRangeGreater('~12.6.0', '12.6.12-prerelease.12')).toBe(true);
  });
  it('should return true if latest', () => {
    expect(isRangeGreater('latest', '~12.5.0')).toBe(true);
  });
  it('should return false if second argument is latest', () => {
    expect(isRangeGreater('^18.3.0', 'latest')).toBe(false);
  });
});

describe('getExternalDependenciesInfo', () => {
  it('should compute the list of dependencies to install', () => {
    expect(getExternalDependenciesInfo({
      o3rPackageJsonPath: join(__dirname, '..', '..', '/testing/mocks/external-dep-test.package.json'),
      projectPackageJson: {
        dependencies: {
          alreadyInstalledPackage: '~12.3.0'
        },
        devDependencies: {
          packageWithWrongRange: '~1.0.0',
          alreadyInstalledPackage: '~12.3.0'
        }
      },
      projectType: 'application',
      dependenciesToInstall: ['alreadyInstalledPackage', 'latestPackage'],
      devDependenciesToInstall: ['missing-package', 'packageWithWrongRange', 'alreadyInstalledPackage']
    }
    )).toEqual({
      packageWithWrongRange: {
        enforceTildeRange: false,
        inManifest: [{ range: '18.0.0', types: ['devDependencies'] }],
        requireInstall: undefined
      },
      latestPackage: {
        enforceTildeRange: false,
        inManifest: [{ range: 'latest', types: ['dependencies'] }],
        requireInstall: undefined
      },
      'missing-package': {
        enforceTildeRange: false,
        inManifest: [{ range: '12.4.0', types: ['devDependencies'] }],
        requireInstall: undefined
      }
    });
  });
});
