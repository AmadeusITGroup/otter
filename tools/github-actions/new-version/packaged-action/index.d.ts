/** Describes the minimal interface that a logger need to implement to be used by the Cascading plugin */
export type BaseLogger = {
    debug: (log: string) => void;
    info: (log: string) => void;
    warning: (log: string) => void;
    error: (log: string) => void;
};
/**
 * Options expected by the NewVersion plug-in
 */
export interface NewVersionOptions<T extends BaseLogger> {
    /** Logger, you can provide here core from `@actions/core` for example */
    logger: T;
    /** If the branching model supports a default branch on top of usual release branches, the branch name */
    defaultBranch?: string;
    /** Regexp of versioned branches */
    releaseBranchRegExp: RegExp;
    /**
     * How versions computed from the default branch should be named.
     *   - If empty, the branch name will be used. ex: 2.6.0-master.0
     *   - If set to 'develop' and defaultBranch is 'master', will output 2.6.0-develop.0
     */
    defaultBranchPrereleaseName?: string;
    /** Version mask to apply when computing a version for the default branch */
    defaultBranchVersionMask?: string;
    /**
     * Release branch to extract Major.Minor version from.
     * If pull request, the target branch. If not, the branch being built.
     */
    baseBranch: string;
    /** Authenticated GIT URL, used to fetch tags from the repository */
    authenticatedGitUrl: string;
    /** Whether we are computing a version for a Pull request or a branch build */
    isPullRequest: boolean;
    /** The unique identifier of the build, used to compute pull request versions */
    buildId: string;
    /**
     * To use for local testing, to tell in which folder the git commands should be executed
     */
    localGitFolder?: string;
    /**
     * Pr pre-release tag
     */
    prPreReleaseTag: string;
}
/**
 * Class responsible for computing the next version according to options and the GIT tags of the repository
 */
export declare class NewVersion {
    private readonly options;
    /** Is the current branch supported by the plug-in to compute a new version */
    isBaseBranchSupported: boolean;
    /** Is the current branch the default branch declared in the options */
    isDefaultBranch: boolean;
    /** Name of the pre-release part of versions computed from the default branch */
    defaultBranchPrereleaseName?: string;
    constructor(options: NewVersionOptions<BaseLogger>);
    /**
     * Computes the next version according to the options and the GIT tags of the repository
     */
    execute(): Promise<string>;
    /**
     * Performs some GIT operations in order to retrieve a list of tags
     */
    retrieveGitTags(): Promise<string[]>;
    /**
     * Returns the mask with which expected version should start.
     * - If release branch it will be the second part of the branch name: release/[3.2.0-alpha]
     * - If default branch, it will be empty by default unless a mask is explicitly given as an option (options.defaultBranchVersionMask)
     */
    getVersionMask(): string;
    /**
     * Compute the next version following the version mask.
     * If your default branch is behind your release branches, the version minor will be bumped
     * @param tags
     * @param versionMask
     */
    computeNewVersion(tags: string[], versionMask: string): string | null;
}
