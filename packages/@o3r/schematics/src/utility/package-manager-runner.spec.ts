import {
  getPackageManagerExecutor,
} from './package-manager-runner';

const npmWorkspaceConfig: any = { cli: { packageManager: 'npm' } };
const yarnWorkspaceConfig: any = { cli: { packageManager: 'yarn' } };

describe('getPackageManagerExecutor', () => {
  test('should return "npm exec --" for npm without packageName', () => {
    expect(getPackageManagerExecutor(npmWorkspaceConfig)).toBe('npm exec --');
  });

  test('should return "yarn exec" for yarn without packageName', () => {
    expect(getPackageManagerExecutor(yarnWorkspaceConfig)).toBe('yarn exec');
  });

  test('should return "npm --workspace <pkg> exec --" for npm with packageName', () => {
    expect(getPackageManagerExecutor(npmWorkspaceConfig, 'my-pkg')).toBe('npm --workspace my-pkg exec --');
  });

  test('should return "yarn workspace <pkg> exec" for yarn with packageName', () => {
    expect(getPackageManagerExecutor(yarnWorkspaceConfig, 'my-pkg')).toBe('yarn workspace my-pkg exec');
  });
});
