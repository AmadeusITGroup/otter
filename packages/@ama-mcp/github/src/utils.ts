/**
 * GitHub tool options
 * @experimental
 */
export interface GithubToolOptions {
  /**
   * GitHub authentication token
   */
  githubToken: string;
}

/**
 * GitHub repository tool options
 * @experimental
 */
export interface GitHubRepositoryToolOptions extends GithubToolOptions {
  /**
   * GitHub repository owner
   */
  owner: string;
  /**
   * GitHub repository name
   */
  repo: string;
}
