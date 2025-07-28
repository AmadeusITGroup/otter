import { GetFile200Response } from '../../models/base/get-file200-response/index';
import { GetFileMeta200Response } from '../../models/base/get-file-meta200-response/index';
import { GetFileNodes200Response } from '../../models/base/get-file-nodes200-response/index';
import { GetFileVersions200Response } from '../../models/base/get-file-versions200-response/index';
import { GetImageFills200Response } from '../../models/base/get-image-fills200-response/index';
import { GetImages200Response } from '../../models/base/get-images200-response/index';

import { FilesApi, FilesApiGetFileRequestData, FilesApiGetFileMetaRequestData, FilesApiGetFileNodesRequestData, FilesApiGetFileVersionsRequestData, FilesApiGetImageFillsRequestData, FilesApiGetImagesRequestData } from './files-api';

export class FilesApiFixture implements Partial<Readonly<FilesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'FilesApi';

    /**
   * Fixture associated to function getFile
   */
  public getFile: jest.Mock<Promise<GetFile200Response>, [FilesApiGetFileRequestData]> = jest.fn();
  /**
   * Fixture associated to function getFileMeta
   */
  public getFileMeta: jest.Mock<Promise<GetFileMeta200Response>, [FilesApiGetFileMetaRequestData]> = jest.fn();
  /**
   * Fixture associated to function getFileNodes
   */
  public getFileNodes: jest.Mock<Promise<GetFileNodes200Response>, [FilesApiGetFileNodesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getFileVersions
   */
  public getFileVersions: jest.Mock<Promise<GetFileVersions200Response>, [FilesApiGetFileVersionsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getImageFills
   */
  public getImageFills: jest.Mock<Promise<GetImageFills200Response>, [FilesApiGetImageFillsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getImages
   */
  public getImages: jest.Mock<Promise<GetImages200Response>, [FilesApiGetImagesRequestData]> = jest.fn();
}

