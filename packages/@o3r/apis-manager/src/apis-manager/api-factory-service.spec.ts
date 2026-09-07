import type {
  ApiClient,
} from '@ama-sdk/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  ApiFactoryService,
} from './api-factory-service';
import {
  ApiManager,
} from './api-manager';
import {
  API_TOKEN,
} from './api-manager-token';

class TestApi {
  public static apiName = 'test-api';

  constructor(public readonly client: ApiClient) {}
}

describe('ApiFactoryService', () => {
  let service: ApiFactoryService;
  let getConfiguration: jest.Mock;

  beforeEach(() => {
    getConfiguration = jest.fn();
    const apiManager = {
      getConfiguration
    } as unknown as ApiManager;

    TestBed.configureTestingModule({
      providers: [{ provide: API_TOKEN, useValue: apiManager }]
    });

    service = TestBed.inject(ApiFactoryService);
  });

  it('should instantiate an API with the configuration returned by the API manager', () => {
    const clientConfig = { basePath: 'https://example.com' } as unknown as ApiClient;
    getConfiguration.mockReturnValue(clientConfig);

    const api = service.createApi(TestApi as never);

    expect(api).toBeInstanceOf(TestApi);
    expect(api.client).toBe(clientConfig);
    expect(getConfiguration).toHaveBeenCalledWith(TestApi);
  });

  it('should use the custom API name when creating an API', () => {
    const clientConfig = { basePath: 'https://custom.example.com' } as unknown as ApiClient;
    getConfiguration.mockReturnValue(clientConfig);

    const api = service.createApi(TestApi as never, 'custom-api-name');

    expect(api).toBeInstanceOf(TestApi);
    expect(api.client).toBe(clientConfig);
    expect(getConfiguration).toHaveBeenCalledWith('custom-api-name');
  });
});
