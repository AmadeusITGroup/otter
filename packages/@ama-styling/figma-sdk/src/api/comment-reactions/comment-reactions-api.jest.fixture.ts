import { DeleteComment200Response } from '../../models/base/delete-comment200-response/index';
import { GetCommentReactions200Response } from '../../models/base/get-comment-reactions200-response/index';

import { CommentReactionsApi, CommentReactionsApiDeleteCommentReactionRequestData, CommentReactionsApiGetCommentReactionsRequestData, CommentReactionsApiPostCommentReactionRequestData } from './comment-reactions-api';

export class CommentReactionsApiFixture implements Partial<Readonly<CommentReactionsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'CommentReactionsApi';

    /**
   * Fixture associated to function deleteCommentReaction
   */
  public deleteCommentReaction: jest.Mock<Promise<DeleteComment200Response>, [CommentReactionsApiDeleteCommentReactionRequestData]> = jest.fn();
  /**
   * Fixture associated to function getCommentReactions
   */
  public getCommentReactions: jest.Mock<Promise<GetCommentReactions200Response>, [CommentReactionsApiGetCommentReactionsRequestData]> = jest.fn();
  /**
   * Fixture associated to function postCommentReaction
   */
  public postCommentReaction: jest.Mock<Promise<DeleteComment200Response>, [CommentReactionsApiPostCommentReactionRequestData]> = jest.fn();
}

