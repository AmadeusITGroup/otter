import { Comment } from '../../models/base/comment/index';
import { DeleteComment200Response } from '../../models/base/delete-comment200-response/index';
import { GetComments200Response } from '../../models/base/get-comments200-response/index';

import { CommentsApi, CommentsApiDeleteCommentRequestData, CommentsApiGetCommentsRequestData, CommentsApiPostCommentRequestData } from './comments-api';

export class CommentsApiFixture implements Partial<Readonly<CommentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'CommentsApi';

    /**
   * Fixture associated to function deleteComment
   */
  public deleteComment: jest.Mock<Promise<DeleteComment200Response>, [CommentsApiDeleteCommentRequestData]> = jest.fn();
  /**
   * Fixture associated to function getComments
   */
  public getComments: jest.Mock<Promise<GetComments200Response>, [CommentsApiGetCommentsRequestData]> = jest.fn();
  /**
   * Fixture associated to function postComment
   */
  public postComment: jest.Mock<Promise<Comment>, [CommentsApiPostCommentRequestData]> = jest.fn();
}

