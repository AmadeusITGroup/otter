import { GetLibraryAnalyticsComponentActions200Response } from '../../models/base/get-library-analytics-component-actions200-response/index';
import { GetLibraryAnalyticsComponentUsages200Response } from '../../models/base/get-library-analytics-component-usages200-response/index';
import { GetLibraryAnalyticsStyleActions200Response } from '../../models/base/get-library-analytics-style-actions200-response/index';
import { GetLibraryAnalyticsStyleUsages200Response } from '../../models/base/get-library-analytics-style-usages200-response/index';
import { GetLibraryAnalyticsVariableActions200Response } from '../../models/base/get-library-analytics-variable-actions200-response/index';
import { GetLibraryAnalyticsVariableUsages200Response } from '../../models/base/get-library-analytics-variable-usages200-response/index';

import { LibraryAnalyticsApi, LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsRequestData, LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesRequestData, LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsRequestData, LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesRequestData, LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsRequestData, LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesRequestData } from './library-analytics-api';

export class LibraryAnalyticsApiFixture implements Partial<Readonly<LibraryAnalyticsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'LibraryAnalyticsApi';

    /**
   * Fixture associated to function getLibraryAnalyticsComponentActions
   */
  public getLibraryAnalyticsComponentActions: jest.Mock<Promise<GetLibraryAnalyticsComponentActions200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsComponentActionsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getLibraryAnalyticsComponentUsages
   */
  public getLibraryAnalyticsComponentUsages: jest.Mock<Promise<GetLibraryAnalyticsComponentUsages200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsComponentUsagesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getLibraryAnalyticsStyleActions
   */
  public getLibraryAnalyticsStyleActions: jest.Mock<Promise<GetLibraryAnalyticsStyleActions200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsStyleActionsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getLibraryAnalyticsStyleUsages
   */
  public getLibraryAnalyticsStyleUsages: jest.Mock<Promise<GetLibraryAnalyticsStyleUsages200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsStyleUsagesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getLibraryAnalyticsVariableActions
   */
  public getLibraryAnalyticsVariableActions: jest.Mock<Promise<GetLibraryAnalyticsVariableActions200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsVariableActionsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getLibraryAnalyticsVariableUsages
   */
  public getLibraryAnalyticsVariableUsages: jest.Mock<Promise<GetLibraryAnalyticsVariableUsages200Response>, [LibraryAnalyticsApiGetLibraryAnalyticsVariableUsagesRequestData]> = jest.fn();
}

