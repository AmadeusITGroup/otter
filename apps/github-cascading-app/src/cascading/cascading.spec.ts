import { AVOID_REVIEWER_BYPASS, Cascading, CASCADING_BRANCH_PREFIX } from './cascading';
import { BaseLogger, CascadingConfiguration, CascadingPullRequestInfo, CheckConclusion } from './interfaces';
import { MESSAGE_NEW_UPDATE } from './cascading';
import { CascadingProbot } from './cascading-probot';

class JestCascading extends Cascading {
  public loadConfiguration = jest.fn<Promise<CascadingConfiguration>, [string]>();
  public deleteBranch = jest.fn<Promise<void>, [string]>();
  public createBranch = jest.fn<Promise<void>, [string, string]>();
  public merge = jest.fn<Promise<void>, [string, string]>();
  public getBranches = jest.fn<Promise<string[]>, []>();
  public createPullRequest = jest.fn<Promise<void>, [string, string, string, string]>();
  public updatePullRequestMessage = jest.fn<Promise<void>, [string | number, string, string | undefined]>();
  public getPullRequests = jest.fn<Promise<CascadingPullRequestInfo[]>, [string, string]>();
  public getPullRequestFromId = jest.fn<Promise<CascadingPullRequestInfo>, [string | number]>();
  public isCascadingPullRequest = jest.fn<Promise<boolean>, [string | number]>();
  public areAllChecksPassed = jest.fn<Promise<boolean>, [string | number, CheckConclusion]>();
  public mergePullRequest = jest.fn<Promise<boolean>, [string | number]>();
  public isBranchAhead = jest.fn<Promise<boolean>, [string, string]>();
}

describe('Cascading Application', () => {

  let customization: JestCascading;

  let logger: BaseLogger;

  beforeEach(() => {
    logger = {
      debug: jest.fn<void, [string]>(),
      error: jest.fn<void, [string]>(),
      info: jest.fn<void, [string]>(),
      warn: jest.fn<void, [string]>()
    };
    customization = new JestCascading(logger);
  });

  describe('calculate the branch to re-evaluate function', () => {
    it('should return undefined when non-cascading pull request', async () => {
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(false);
      await expect(customization.branchToReevaluateCascading({id: 1, body: 'fake PR'})).resolves.toBe(undefined);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return undefined when no re-evaluation requested', async () => {
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      await expect(customization.branchToReevaluateCascading({ id: 1, body: `
---
${MESSAGE_NEW_UPDATE.replace('[x]', '[ ]') as string} release/0.1
---
      ` })).resolves.toBe(undefined);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should return the name of the original branch', async () => {
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      await expect(customization.branchToReevaluateCascading({
        id: 1, body: `
---
${MESSAGE_NEW_UPDATE as string} release/0.1
---
      ` })).resolves.toBe('release/0.1');
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('merge cascading pull request', () => {
    it('should skip the process when disabled via config', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: false });
      await expect(customization.mergeCascadingPullRequest({id: 1}, `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'success')).resolves.not.toThrow();
      expect(logger.info).not.toHaveBeenCalled();
      expect(customization.mergePullRequest).not.toHaveBeenCalled();
    });

    it('should skip the process when it is not a cascading pull request', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: true });
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(false);
      await expect(customization.mergeCascadingPullRequest({ id: 1 }, 'other/1.0.0-1.1.0', 'success')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalled();
      expect(customization.mergePullRequest).not.toHaveBeenCalled();
    });

    it('should skip the process when the PR build is failing', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: true });
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      customization.areAllChecksPassed = customization.areAllChecksPassed.mockResolvedValue(false);
      await expect(customization.mergeCascadingPullRequest({ id: 1 }, `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'failure')).resolves.not.toThrow();
      expect(logger.warn).toHaveBeenCalled();
      expect(customization.mergePullRequest).not.toHaveBeenCalled();
    });

    it('should skip the process when disabled in the PR', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: true });
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      customization.areAllChecksPassed = customization.areAllChecksPassed.mockResolvedValue(true);
      customization.getPullRequestFromId = customization.getPullRequestFromId.mockResolvedValue({
        id: 1,
        isOpen: true,
        body: AVOID_REVIEWER_BYPASS.replace('[ ]', '[x]')
      });
      await expect(customization.mergeCascadingPullRequest({ id: 1 }, `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'success')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalled();
      expect(customization.mergePullRequest).not.toHaveBeenCalled();
    });

    it('should merge a cascading pull request', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: true });
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      customization.areAllChecksPassed = customization.areAllChecksPassed.mockResolvedValue(true);
      customization.getPullRequestFromId = customization.getPullRequestFromId.mockResolvedValue({
        id: 1,
        isOpen: true,
        body: AVOID_REVIEWER_BYPASS
      });
      customization.mergePullRequest = customization.mergePullRequest.mockResolvedValue(true);
      await expect(customization.mergeCascadingPullRequest({ id: 1 }, `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'success')).resolves.not.toThrow();
      expect(logger.error).not.toHaveBeenCalled();
      expect(customization.mergePullRequest).toHaveBeenCalled();
    });

    it('should handle merge error', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, bypassReviewers: true });
      customization.isCascadingPullRequest = customization.isCascadingPullRequest.mockResolvedValue(true);
      customization.areAllChecksPassed = customization.areAllChecksPassed.mockResolvedValue(true);
      customization.getPullRequestFromId = customization.getPullRequestFromId.mockResolvedValue({
        id: 1,
        isOpen: true,
        body: AVOID_REVIEWER_BYPASS
      });
      customization.mergePullRequest = customization.mergePullRequest.mockResolvedValue(false);
      await expect(customization.mergeCascadingPullRequest({ id: 1 }, `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'success')).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalled();
      expect(customization.mergePullRequest).toHaveBeenCalled();
    });
  });

  describe('cascade', () => {
    it('should skip when non-cascading branch', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({ ...CascadingProbot.DEFAULT_CONFIGURATION, cascadingBranchesPattern: 'test-cascading/.*' });
      customization.getBranches = customization.getBranches.mockResolvedValue([]);
      await expect(customization.cascade('release/1.0')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('Skip cascading because the branch "release/1.0" does not match "test-cascading/.*"');
      expect(logger.info).not.toHaveBeenCalledWith('Cascading plugin execution');
      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('Cascading plugin execution');
    });

    it('should skip ignored branches', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*',
        ignoredPatterns: ['-test$']
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([]);
      await expect(customization.cascade('test-cascading/1.0-test')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('Skip cascading because the branch "test-cascading/1.0-test" is ignored');
      expect(logger.info).not.toHaveBeenCalledWith('Cascading plugin execution');
      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('Cascading plugin execution');
    });

    it('should skip ignored branch if not ahead', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*'
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([
        'test-cascading/1.1',
        'other-branch',
        'test-cascading/1.0'
      ]);
      customization.isBranchAhead = customization.isBranchAhead.mockResolvedValue(false);
      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      expect(logger.info).toHaveBeenCalledWith('test-cascading/1.0 is not ahead of test-cascading/1.1. The cascading process will be skipped');
      expect(customization.createPullRequest).not.toHaveBeenCalledWith();
    });

    it('should create properly ordered cascading branch', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*'
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([
        'test-cascading/1.1',
        'other-branch',
        'my-test-default',
        'test-cascading/1.0'
      ]);
      customization.isBranchAhead = customization.isBranchAhead.mockResolvedValue(true);
      customization.createBranch = customization.createBranch.mockResolvedValue();
      customization.getPullRequests = customization.getPullRequests.mockResolvedValue([]);

      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      const expectedBranchList = [
        'test-cascading/1.0',
        'test-cascading/1.1'
      ];
      expect(logger.debug).toHaveBeenCalledWith(`Discovered following branches to cascade ${JSON.stringify(expectedBranchList, null, 2)}`);
    });

    it('should create properly ordered cascading branch when default branch specified', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*',
        defaultBranch: 'my-test-default'
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([
        'test-cascading/1.1',
        'other-branch',
        'my-test-default',
        'test-cascading/1.0'
      ]);
      customization.isBranchAhead = customization.isBranchAhead.mockResolvedValue(true);
      customization.createBranch = customization.createBranch.mockResolvedValue();
      customization.getPullRequests = customization.getPullRequests.mockResolvedValue([]);

      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      const expectedBranchList = [
        'test-cascading/1.0',
        'test-cascading/1.1',
        'my-test-default'
      ];
      expect(logger.debug).toHaveBeenCalledWith(`Discovered following branches to cascade ${JSON.stringify(expectedBranchList, null, 2)}`);
    });

    it('should create a new cascading branch and create a pull request', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*'
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([
        'test-cascading/1.1',
        'other-branch',
        'test-cascading/1.0'
      ]);
      customization.isBranchAhead = customization.isBranchAhead.mockResolvedValue(true);
      customization.createBranch = customization.createBranch.mockResolvedValue();
      customization.getPullRequests = customization.getPullRequests.mockResolvedValue([]);
      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      expect(customization.createBranch).toHaveBeenCalledWith(`${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`, 'test-cascading/1.0');
      expect(customization.createPullRequest).toHaveBeenCalled();
    });

    it('should update an existing an existing and create a pull request', async () => {
      customization.loadConfiguration = customization.loadConfiguration.mockResolvedValue({
        ...CascadingProbot.DEFAULT_CONFIGURATION,
        cascadingBranchesPattern: 'test-cascading/.*'
      });
      customization.getBranches = customization.getBranches.mockResolvedValue([
        'test-cascading/1.1',
        'other-branch',
        'test-cascading/1.0',
        `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`
      ]);
      customization.isBranchAhead = customization.isBranchAhead.mockResolvedValue(true);
      customization.createBranch = customization.createBranch.mockResolvedValue();
      customization.getPullRequests = customization.getPullRequests.mockResolvedValue([]);
      await expect(customization.cascade('test-cascading/1.0')).resolves.not.toThrow();
      expect(customization.merge).toHaveBeenCalledWith('test-cascading/1.0', `${CASCADING_BRANCH_PREFIX as string}/1.0.0-1.1.0`);
      expect(customization.createBranch).not.toHaveBeenCalled();
      expect(customization.createPullRequest).toHaveBeenCalled();
    });
  });
});
