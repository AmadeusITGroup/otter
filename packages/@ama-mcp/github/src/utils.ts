export interface GithubToolOptions {
  /**
   * GitHub authentication token
   */
  githubToken: string;
}

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
