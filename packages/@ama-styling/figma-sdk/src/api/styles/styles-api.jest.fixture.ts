import { GetFileStyles200Response } from '../../models/base/get-file-styles200-response/index';
import { GetStyle200Response } from '../../models/base/get-style200-response/index';
import { GetTeamStyles200Response } from '../../models/base/get-team-styles200-response/index';

import { StylesApi, StylesApiGetFileStylesRequestData, StylesApiGetStyleRequestData, StylesApiGetTeamStylesRequestData } from './styles-api';

export class StylesApiFixture implements Partial<Readonly<StylesApi>> {

  /** @inheritDoc */
  public readonly apiName = 'StylesApi';

    /**
   * Fixture associated to function getFileStyles
   */
  public getFileStyles: jest.Mock<Promise<GetFileStyles200Response>, [StylesApiGetFileStylesRequestData]> = jest.fn();
  /**
   * Fixture associated to function getStyle
   */
  public getStyle: jest.Mock<Promise<GetStyle200Response>, [StylesApiGetStyleRequestData]> = jest.fn();
  /**
   * Fixture associated to function getTeamStyles
   */
  public getTeamStyles: jest.Mock<Promise<GetTeamStyles200Response>, [StylesApiGetTeamStylesRequestData]> = jest.fn();
}

