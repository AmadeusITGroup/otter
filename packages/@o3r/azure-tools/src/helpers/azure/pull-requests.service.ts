import {
  getPersonalAccessTokenHandler,
  WebApi,
} from 'azure-devops-node-api';
import {
  Comment,
  CommentThreadStatus,
  GitPullRequestCommentThread,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {
  Logger,
} from 'winston';

/**
 * Service to call AzureDevops API about PR
 */
export class PullRequestService {
  private readonly connection: WebApi;

  constructor(token: string, private readonly project: string, orgUrl: string, private readonly logger: Logger) {
    this.connection = new WebApi(orgUrl, getPersonalAccessTokenHandler(token));
  }

  /**
   * Remove all commments to a thread to make it disappear on the UI
   * @param repoName Repository name
   * @param pullRequestId Pull Request ID
   * @param threadId Id of the thread to be removed
   */
  public async deleteThread(repoName: string, pullRequestId: number, threadId: number): Promise<void> {
    this.logger.info(`Deleting thread ${threadId}...`);
    const gitApi = await this.connection.getGitApi();
    const comments = await gitApi.getComments(repoName, pullRequestId, threadId, this.project);
    await Promise.all(
      comments
        .filter((comment): comment is Comment & { id: string } => !!comment.id)
        .map((comment) => gitApi.deleteComment(repoName, pullRequestId, threadId, comment.id, this.project)));
  }

  /**
   * Add a comment to a thread
   * @param repoName Repository name
   * @param pullRequestId Pull Request ID
   * @param thread Thread to be removed
   * @param comment Comment to be added
   */
  public async addCommentToThread(repoName: string, pullRequestId: number, thread: GitPullRequestCommentThread, comment: string): Promise<Comment> {
    if (!thread.id) {
      const errorMsg = 'Cannot add comment. No thread ID provided.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    this.logger.info(`Adding comment to thread ${thread.id}...`);
    const gitApi = await this.connection.getGitApi();
    return gitApi.createComment(
      { content: comment } as Comment,
      repoName,
      pullRequestId,
      thread.id,
      this.project
    );
  }

  /**
   * Add a new thread
   * @param repoName Repository name
   * @param pullRequestId Pull Request ID
   * @param comment Comment to be added
   * @param status Comment status
   * @param threadIdentifier Thread identifier
   */
  public async addThread(
    repoName: string,
    pullRequestId: number,
    comment: string,
    status: CommentThreadStatus,
    threadIdentifier?: string
  ): Promise<GitPullRequestCommentThread> {
    this.logger.info(`Adding thread to pull request ${pullRequestId}: ${comment}...`);

    const gitApi = await this.connection.getGitApi();
    return gitApi.createThread(
      {
        status,
        comments: [{ content: comment }],
        ...(threadIdentifier ? { properties: { threadIdentifier } } : {})
      } as GitPullRequestCommentThread,
      repoName,
      pullRequestId,
      this.project
    );
  }

  /**
   * Find threads filtering by identifier
   * @param repoName Repository name
   * @param pullRequestId Pull Request ID
   * @param threadIdentifier Thread identifier
   */
  public async findThreadsByIdentifier(repoName: string, pullRequestId: number, threadIdentifier: string): Promise<GitPullRequestCommentThread[]> {
    const gitApi = await this.connection.getGitApi();
    const threads = await gitApi.getThreads(repoName, pullRequestId, this.project);
    return threads.filter((thread) => thread.properties?.threadIdentifier?.$value === threadIdentifier);
  }
}
