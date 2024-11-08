import type {
  InterfaceOf,
} from '@o3r/core';
import type {
  RequestParametersConfig,
  RequestParametersService,
} from '@o3r/dynamic-content';
import {
  StorageStrategy,
} from '@o3r/dynamic-content';

/**
 * Fixture file for requestParameters service
 */
export class RequestParametersServiceFixture implements InterfaceOf<RequestParametersService> {
  public query: { [key: string]: string } = {};
  public post: { [key: string]: string } = {};
  public config: RequestParametersConfig = {
    strategy: StorageStrategy.Rehydrate,
    storage: (typeof window === 'undefined') ? undefined : window.sessionStorage,
    queryParamsValue: '{}',
    postParamsValue: '{}'
  };

  public getQueryParameter: jest.Mock<any, any>;
  public getQueryParameterAsBoolean: jest.Mock<any, any>;
  public getPostParameter: jest.Mock<any, any>;
  public getPostParameterAsBoolean: jest.Mock<any, any>;
  public getParameter: jest.Mock<any, any>;
  public getParameterAsBoolean: jest.Mock<any, any>;
  public clearQueryParameters: jest.Mock<any, any>;
  public clearPostParameters: jest.Mock<any, any>;
  public getFilteredParameters: jest.Mock<any, any>;
  public getParams: jest.Mock<any, any>;

  constructor() {
    this.getQueryParameter = jest.fn();
    this.getQueryParameterAsBoolean = jest.fn();
    this.getPostParameter = jest.fn();
    this.getPostParameterAsBoolean = jest.fn();
    this.getParameter = jest.fn();
    this.getParameterAsBoolean = jest.fn();
    this.clearQueryParameters = jest.fn();
    this.clearPostParameters = jest.fn();
    this.getParams = jest.fn();
    this.getFilteredParameters = jest.fn();
  }
}
