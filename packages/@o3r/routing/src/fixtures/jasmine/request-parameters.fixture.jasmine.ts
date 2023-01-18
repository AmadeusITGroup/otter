import type { InterfaceOf } from '@o3r/core';
import type { RequestParametersConfig, RequestParametersService } from '@o3r/routing';
import { StorageStrategy } from '@o3r/routing';

/**
 * Fixture file for requestParameters service
 */
export class RequestParametersServiceFixture implements InterfaceOf<RequestParametersService> {
  public query: {[key: string]: string} = {};
  public post: {[key: string]: string} = {};
  public config: RequestParametersConfig = {
    strategy: StorageStrategy.Rehydrate,
    storage: (typeof window !== 'undefined') ? window.sessionStorage : undefined,
    queryParamsValue: '{}',
    postParamsValue: '{}'
  };

  public getQueryParameter: jasmine.Spy;
  public getQueryParameterAsBoolean: jasmine.Spy;
  public getPostParameter: jasmine.Spy;
  public getPostParameterAsBoolean: jasmine.Spy;
  public getParameter: jasmine.Spy;
  public getParameterAsBoolean: jasmine.Spy;
  public clearQueryParameters: jasmine.Spy;
  public clearPostParameters: jasmine.Spy;
  public getFilteredParameters: jasmine.Spy;
  public getParams: jasmine.Spy;

  constructor() {
    this.getQueryParameter = jasmine.createSpy('getQueryParameter');
    this.getQueryParameterAsBoolean = jasmine.createSpy('getQueryParameterAsBoolean');
    this.getPostParameter = jasmine.createSpy('getPostParameter');
    this.getPostParameterAsBoolean = jasmine.createSpy('getPostParameterAsBoolean');
    this.getParameter = jasmine.createSpy('getParameter');
    this.getParameterAsBoolean = jasmine.createSpy('getParameterAsBoolean');
    this.clearQueryParameters = jasmine.createSpy('clearQueryParameters');
    this.clearPostParameters = jasmine.createSpy('clearPostParameters');
    this.getParams = jasmine.createSpy('getParams');
    this.getFilteredParameters = jasmine.createSpy('filterParameters');
  }
}
