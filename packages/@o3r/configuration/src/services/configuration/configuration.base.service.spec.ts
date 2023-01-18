/* eslint-disable @typescript-eslint/naming-convention */
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Configuration, CustomConfig } from '@o3r/core';
import { ConfigurationStore, selectConfigurationEntities, upsertConfigurationEntities, upsertConfigurationEntity } from '../../stores/index';
import { ConfigurationBaseService } from './configuration.base.service';


interface MyConfigToTest extends Configuration {
  fieldNumber: number;
  fieldString: string;
}

const myInitialConfiguration: MyConfigToTest = {
  fieldNumber: 20,
  fieldString: 'showBtn'
};

const additionalConfig = {
  additionalField: 10
};

const globalConfig = {'demo-cabinCodeEco': 'ECO1', 'refx-priceDisplay': 'short'};

const staticConfig: CustomConfig[] = [{
  name: 'SearchTypePresenter',
  library: '@otter/components',
  config: {showComplexBtn: true}
},
{
  name: 'global',
  config: {'demo-minNbAdults': 4}
}];

describe('ConfigurationBaseService', () => {

  let service: ConfigurationBaseService;
  let mockStore: MockStore<ConfigurationStore>;

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        ConfigurationBaseService
      ]
    }).compileComponents();

    service = TestBed.inject(ConfigurationBaseService);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(selectConfigurationEntities, {});
    jest.spyOn(mockStore, 'dispatch');
  });

  it('should add globalconfig config', () => {
    service.upsertConfiguration(globalConfig);

    expect(mockStore.dispatch).toHaveBeenCalledWith(upsertConfigurationEntity({id: 'global', configuration: globalConfig}));
  });

  it('should update a specific component config', () => {
    service.upsertConfiguration(myInitialConfiguration, 'INITIAL_CONFIG');

    expect(mockStore.dispatch).toHaveBeenCalledWith(upsertConfigurationEntity({id: 'INITIAL_CONFIG', configuration: myInitialConfiguration}));
  });

  it('should extend the existing config and not touch the existing fields', () => {
    service.extendConfiguration(additionalConfig, 'MY_COMPONENT_TEST_CONFIG');

    expect(mockStore.dispatch).toHaveBeenCalledWith(upsertConfigurationEntity({id: 'MY_COMPONENT_TEST_CONFIG', configuration: {additionalField: additionalConfig.additionalField}}));
  });

  it('should get the configuration from body tag', () => {
    const spy = jest.spyOn(service, 'computeConfiguration');
    const configTag = 'staticconfig';
    document.body.dataset[configTag] = JSON.stringify(staticConfig);
    service.getConfigFromBodyTag(configTag);

    expect(spy).toHaveBeenCalledWith(staticConfig);
  });

  it('should put the configuration from body tag in the store', () => {
    service.computeConfiguration(staticConfig);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      upsertConfigurationEntities({
        entities: {
          '@otter/components#SearchTypePresenter': {showComplexBtn: true, id: '@otter/components#SearchTypePresenter'},
          global: {'demo-minNbAdults': 4, id: 'global'}
        }
      })
    );
  });
});
