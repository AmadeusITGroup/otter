import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  MockStore,
  provideMockStore,
} from '@ngrx/store/testing';
import {
  Configuration,
  CustomConfig,
} from '@o3r/core';
import {
  Subscription,
} from 'rxjs';
import {
  ConfigurationStore,
  globalConfigurationId,
  selectConfigOverride,
  selectConfigurationEntities,
  upsertConfigurationEntities,
  upsertConfigurationEntity,
} from '../../stores/index';
import {
  ConfigurationBaseService,
} from './configuration.base.service';

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

const globalConfig = { demoCabinCodeEco: 'ECO1', priceDisplay: 'short' };

const staticConfig: CustomConfig[] = [{
  name: 'SearchTypePresenter',
  library: '@otter/components',
  config: { showComplexBtn: true }
},
{
  name: 'global',
  config: { demoMinNbAdults: 4 }
}];

describe('ConfigurationBaseService', () => {
  let service: ConfigurationBaseService;
  let mockStore: MockStore<ConfigurationStore>;
  let mockDispatch: jest.SpyInstance;

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
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
  });

  it('should add globalconfig config', () => {
    service.upsertConfiguration(globalConfig);

    expect(mockDispatch).toHaveBeenCalledWith(upsertConfigurationEntity({ id: 'global', configuration: globalConfig }));
  });

  it('should update a specific component config', () => {
    service.upsertConfiguration(myInitialConfiguration, 'INITIAL_CONFIG');

    expect(mockDispatch).toHaveBeenCalledWith(upsertConfigurationEntity({ id: 'INITIAL_CONFIG', configuration: myInitialConfiguration }));
  });

  it('should extend the existing config and not touch the existing fields', () => {
    service.extendConfiguration(additionalConfig, 'MY_COMPONENT_TEST_CONFIG');

    expect(mockDispatch).toHaveBeenCalledWith(upsertConfigurationEntity({ id: 'MY_COMPONENT_TEST_CONFIG', configuration: { additionalField: additionalConfig.additionalField } }));
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

    expect(mockDispatch).toHaveBeenCalledWith(
      upsertConfigurationEntities({
        entities: {
          '@otter/components#SearchTypePresenter': { showComplexBtn: true, id: '@otter/components#SearchTypePresenter' },
          global: { demoMinNbAdults: 4, id: 'global' }
        }
      })
    );
  });

  describe('getConfig emissions', () => {
    const configId = 'my-config';
    const configInitialValue = {
      id: configId,
      prop: 'value1'
    };
    const spy = jest.fn();
    let subscription: Subscription;

    beforeEach(() => {
      mockStore.overrideSelector(selectConfigurationEntities, { [configId]: configInitialValue });
      subscription = service.getConfig(configId).subscribe(spy);
      spy.mockReset();
    });

    afterAll(() => {
      subscription?.unsubscribe();
    });

    it('should not emit if we do not change the INITIAL_CONFIG value', () => {
      mockStore.overrideSelector(selectConfigurationEntities, {
        [configId]: configInitialValue,
        ANOTHER_CONFIG: {
          id: 'ANOTHER_CONFIG',
          prop: 'value1'
        }
      });
      mockStore.refreshState();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit if we change the INITIAL_CONFIG value', () => {
      mockStore.overrideSelector(selectConfigurationEntities, {
        [configId]: { ...configInitialValue, prop: 'change' }
      });
      mockStore.refreshState();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ prop: 'change' }));
    });

    it('should not emit if we change the global config as the INITIAL_CONFIG will override its value', () => {
      mockStore.overrideSelector(selectConfigurationEntities, {
        [globalConfigurationId]: {
          id: globalConfigurationId,
          prop: 'will not override'
        },
        [configId]: configInitialValue
      });
      mockStore.refreshState();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit if we change the override config', () => {
      mockStore.overrideSelector(selectConfigOverride, { [configId]: { prop: 'change' } });
      mockStore.refreshState();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ prop: 'change' }));
    });

    it('should not emit if we change the config value when it is overriden by the override config', () => {
      mockStore.overrideSelector(selectConfigOverride, { [configId]: { prop: 'override' } });
      mockStore.refreshState();
      spy.mockReset();
      mockStore.overrideSelector(selectConfigurationEntities, {
        [configId]: { ...configInitialValue, prop: 'change' }
      });
      mockStore.refreshState();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
