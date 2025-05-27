import { CommentReactionsApi } from './comment-reactions-api';

export class CommentReactionsApiFixture implements Partial<Readonly<CommentReactionsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'CommentReactionsApi';

    /**
   * Fixture associated to function deleteCommentReaction
   */
  public deleteCommentReaction: jasmine.Spy = jasmine.createSpy('deleteCommentReaction');
  /**
   * Fixture associated to function getCommentReactions
   */
  public getCommentReactions: jasmine.Spy = jasmine.createSpy('getCommentReactions');
  /**
   * Fixture associated to function postCommentReaction
   */
  public postCommentReaction: jasmine.Spy = jasmine.createSpy('postCommentReaction');
}
