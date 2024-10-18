import {
  BaseLogger,
  NewVersion,
  NewVersionOptions
} from './index';

const mockLogger: BaseLogger = {
  debug: console.debug,
  // eslint-disable-next-line no-console
  error: console.error,
  info: console.info,
  warning: console.warn
};

describe('New Version', () => {
  describe('Compute version', () => {
    describe('on release branch', () => {
      const defaultConfig: NewVersionOptions<BaseLogger> = {
        buildId: '123456',
        logger: mockLogger,
        authenticatedGitUrl: 'dummy',
        baseBranch: '2.6',
        isPullRequest: false,
        prPreReleaseTag: 'pr',
        releaseBranchRegExp: new RegExp(/release\/(0|[1-9]\d*)\.(0|[1-9]\d*)(\.0-(next|prerelease|rc))?$/)
      };

      const defaultTags = ['0.10.0', '2.6.0', '3.1.5', '3.2.4', '3.2.5.0', 'whatever', '3.3.0-alpha.0', '3.3.0-alpha.0', '3.3.0-rc.0'];

      it('should compute release versions correctly', () => {
        const plugin = new NewVersion(defaultConfig);
        expect(plugin.computeNewVersion(defaultTags, '2.6')).toBe('2.6.1');
        expect(plugin.computeNewVersion(defaultTags, '3.1')).toBe('3.1.6');
        expect(plugin.computeNewVersion(defaultTags, '3.2')).toBe('3.2.5');
        expect(plugin.computeNewVersion(defaultTags, '3.3')).toBe('3.3.0');
        expect(plugin.computeNewVersion(defaultTags, '3.4')).toBe('3.4.0');
      });

      it('should compute pre-release versions correctly', () => {
        const plugin = new NewVersion(defaultConfig);
        expect(plugin.computeNewVersion(defaultTags, '2.6.0-alpha')).toBe('2.6.0-alpha.0');
        expect(plugin.computeNewVersion(defaultTags, '3.3.0-alpha')).toBe('3.3.0-alpha.1');
        expect(plugin.computeNewVersion(defaultTags, '3.4.0-alpha')).toBe('3.4.0-alpha.0');
        expect(plugin.computeNewVersion(defaultTags, '4.0.0-next')).toBe('4.0.0-next.0');
      });

      it('should compute pull request versions correctly', () => {
        const plugin = new NewVersion({
          ...defaultConfig,
          isPullRequest: true
        });
        expect(plugin.computeNewVersion(defaultTags, '3.2')).toBe(`3.2.4-pr.${defaultConfig.buildId}`);
        expect(plugin.computeNewVersion(defaultTags, '3.1')).toBe(`3.1.5-pr.${defaultConfig.buildId}`);
        expect(plugin.computeNewVersion(defaultTags, '3.3.0-alpha')).toBe(`3.3.0-alpha.0-pr.${defaultConfig.buildId}`);
        expect(plugin.computeNewVersion(defaultTags, '4.0.0-next')).toBe(`4.0.0-next.0-pr.${defaultConfig.buildId}`);
      });
    });

    describe('On default branch', () => {
      const defaultConfig: NewVersionOptions<BaseLogger> = {
        buildId: '123456',
        logger: mockLogger,
        authenticatedGitUrl: 'dummy',
        baseBranch: 'develop',
        isPullRequest: false,
        defaultBranch: 'develop',
        prPreReleaseTag: 'pr',
        releaseBranchRegExp: new RegExp(/release\/(0|[1-9]\d*)\.(0|[1-9]\d*)(\.0-(next|prerelease|rc))?$/)
      };

      it('should compute release versions correctly', () => {
        const plugin = new NewVersion(defaultConfig);

        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '')).toBe('2.8.0-develop.0');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.8.0-develop.5'], '')).toBe('2.8.0-develop.6');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '3')).toBe('3.0.0-develop.0');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '3.3')).toBe('3.3.0-develop.0');
        expect(plugin.computeNewVersion(['3.3.0-develop.0', '3.3.0-rc.0'], '')).toBe('3.4.0-develop.0');
      });

      it('should compute pull request versions correctly', () => {
        const plugin = new NewVersion({
          ...defaultConfig,
          isPullRequest: true
        });
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '')).toBe('2.8.0-develop.0-pr.123456');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.8.0-develop.5'], '')).toBe('2.8.0-develop.5-pr.123456');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '3')).toBe('3.0.0-develop.0-pr.123456');
        expect(plugin.computeNewVersion(['2.6.5', '2.7.0', '2.7.1', '2.7.0-develop.5'], '3.3')).toBe('3.3.0-develop.0-pr.123456');
      });
    });
  });
});
