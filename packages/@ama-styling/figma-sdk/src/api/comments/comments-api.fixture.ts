import { CommentsApi } from './comments-api';

export class CommentsApiFixture implements Partial<Readonly<CommentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'CommentsApi';

    /**
   * Fixture associated to function deleteComment
   */
  public deleteComment: jasmine.Spy = jasmine.createSpy('deleteComment');
  /**
   * Fixture associated to function getComments
   */
  public getComments: jasmine.Spy = jasmine.createSpy('getComments');
  /**
   * Fixture associated to function postComment
   */
  public postComment: jasmine.Spy = jasmine.createSpy('postComment');
}
