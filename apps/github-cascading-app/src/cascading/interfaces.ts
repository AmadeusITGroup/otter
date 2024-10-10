/** Describes the minimal interface that a logger need to implement to be used by the Cascading plugin */
export type BaseLogger = { debug: (log: string) => void; info: (log: string) => void; warn: (log: string) => void; error: (log: string) => void };

/**
 * Cascading Configuration received from the base repository
 */
export interface CascadingConfiguration {
  /** Ignore the branches that match this pattern for the cascading */
  ignoredPatterns: string[];
  /** The default branch if you have one (ex: master, development), if no candidate found with the given pattern this branch will be the last one where the code will be cascaded */
  defaultBranch: string;
  /** Pattern determining if the branch is part of the cascading strategy */
  cascadingBranchesPattern: string;
  /** Pattern containing a capture to extract the version of a cascading branch */
  versionCapturePattern: string;
  /** Bypass the reviewers validation for the pull request, only the CI checks will be executed */
  bypassReviewers: boolean;
  /** List of labels to be added to the Pull Request */
  labels: string[];
  /**
   * Title of the generated pull request
   *
   * The text can include the following variables that will be replaced by the cascading app:
   * - **$origin** : Origin branch
   * - **$target** : Target branch
   */
  pullRequestTitle: string;
  /** Prefix of the branch created for creating process */
  branchNamePrefix: string;
}

export interface PullRequestContext {
  /** Cascading Origin Branch */
  currentBranch: string;
  /** Cascading Pull Request Target Branch */
  targetBranch: string;
  /** Determine if the reviewers are bypassed */
  bypassReviewers: boolean;
  /** Is the an update of the {@link currentBranch} conflicting */
  isConflicting: boolean;
}

/** Minimal information required from a Pull Request */
export interface CascadingPullRequestInfo {
  /** ID of the Pull Request Author */
  authorId?: string | number;
  /** Body of the pull request */
  body: string | null;
  /** Determine if the pull request is still open */
  isOpen: boolean;
  /** Name of the branch origin of the pull request */
  originBranchName: string;
  /** ID of the pull request */
  id: string | number;
  /** Context of the Pull Request (parsed from content) */
  context?: PullRequestContext;
  /** Determine if the pull request can be merged */
  mergeable: boolean | null;
}

/** Check suite possible conclusions */
export type CheckConclusion = 'cancelled' | 'neutral' | 'success' | 'failure' | 'timed_out' | 'action_required' | 'stale' | null;

/**
 * Default configuration
 */
export const DEFAULT_CONFIGURATION = {
  ignoredPatterns: [] as string[],
  defaultBranch: '',
  cascadingBranchesPattern: '^releases?/\\d+\\.\\d+',
  versionCapturePattern: '/((?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:\\.0-[^ ]+)?)$',
  bypassReviewers: false,
  labels: [] as string[],
  pullRequestTitle: '[cascading] from $origin to $target',
  branchNamePrefix: 'cascading'
} as const satisfies Readonly<CascadingConfiguration>;
