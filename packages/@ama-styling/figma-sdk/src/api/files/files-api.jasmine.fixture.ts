import { FilesApi } from './files-api';

export class FilesApiFixture implements Partial<Readonly<FilesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'FilesApi';

    /**
   * Fixture associated to function getFile
   */
  public getFile: jasmine.Spy = jasmine.createSpy('getFile');
  /**
   * Fixture associated to function getFileMeta
   */
  public getFileMeta: jasmine.Spy = jasmine.createSpy('getFileMeta');
  /**
   * Fixture associated to function getFileNodes
   */
  public getFileNodes: jasmine.Spy = jasmine.createSpy('getFileNodes');
  /**
   * Fixture associated to function getFileVersions
   */
  public getFileVersions: jasmine.Spy = jasmine.createSpy('getFileVersions');
  /**
   * Fixture associated to function getImageFills
   */
  public getImageFills: jasmine.Spy = jasmine.createSpy('getImageFills');
  /**
   * Fixture associated to function getImages
   */
  public getImages: jasmine.Spy = jasmine.createSpy('getImages');
}
