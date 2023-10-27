/* eslint-disable @typescript-eslint/naming-convention */
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Dictionary } from '@ngrx/entity';
import { Configuration } from '@o3r/core';
import {
  clearConfigurationEntities, updateConfigurationEntities, updateConfigurationEntity, upsertConfigurationEntities,
  upsertConfigurationEntity
} from './configuration.actions';
import { configurationAdapter, configurationInitialState, configurationReducer } from './configuration.reducer';
import { ConfigurationModel } from './configuration.state';

interface MyConfigToTest extends Configuration {
  fieldNumber: number;
  fieldString: string;
}

interface MySecondConfigToTest extends Configuration {
  secondNumber: number;
  secondString: string;
}

const myInitialConfiguration: MyConfigToTest = {
  fieldNumber: 20,
  fieldString: 'showBtn'
};

const myUpdateConfiguration: MyConfigToTest = {
  fieldNumber: 30,
  fieldString: 'showBtn'
};

const myPartialUpdateConfiguration: Partial<MyConfigToTest> = {
  fieldNumber: 1000
};

const mySecondUpdateConfiguration: MySecondConfigToTest = {
  secondNumber: 100,
  secondString: 'myNewComponent'
};

const mySecondComponentConfiguration: MySecondConfigToTest = {
  secondNumber: 10,
  secondString: 'myNewComponent'
};

const componentsConfigurations = {
  MY_COMPONENT_TEST_CONFIG: myInitialConfiguration,
  MY_SECOND_COMPONENT: mySecondComponentConfiguration
};

const updatedComponentsConfiguration = {
  MY_SECOND_COMPONENT: mySecondUpdateConfiguration
};

const componentsConfigurationsModel = (Object.keys(componentsConfigurations) as (keyof typeof updatedComponentsConfiguration)[]).map((id) => ({id, ...componentsConfigurations[id]}));

const getEntity = (entities: Dictionary<ConfigurationModel>, entityId: string): ConfigurationModel | undefined => entities[entityId];

describe('Configuration Store', () => {
  beforeAll(() =>
    getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: { destroyAfterEach: false }
    })
  );

  beforeEach(() => {
    configurationReducer(configurationInitialState, {type: 'fake'} as any);
  });

  it('should have the correct initial state', () => {
    expect(configurationInitialState.ids).toEqual([]);
  });

  it('UPSERT_ENTITIES should add the configuration for multiple components', () => {
    const state = configurationReducer(configurationInitialState, upsertConfigurationEntities({entities: componentsConfigurations}));

    expect(state.ids.length).toEqual(2);
    const firstEntity = getEntity(state.entities, 'MY_COMPONENT_TEST_CONFIG');
    const secondEntity = getEntity(state.entities, 'MY_SECOND_COMPONENT');

    expect(firstEntity).toBeDefined();
    expect(secondEntity).toBeDefined();
    if (!firstEntity) { return; }

    expect(firstEntity.fieldNumber).toEqual(myInitialConfiguration.fieldNumber);
    if (!secondEntity) { return; }

    expect(secondEntity.secondNumber).toEqual(mySecondComponentConfiguration.secondNumber);
  });

  it('UPSERT_ENTITIES should update the configuration for multiple components', () => {
    const state = configurationAdapter.addMany(componentsConfigurationsModel, configurationInitialState);
    const newState = configurationReducer(state, upsertConfigurationEntities({entities: updatedComponentsConfiguration}));
    const firstEntity = getEntity(newState.entities, 'MY_COMPONENT_TEST_CONFIG');
    const secondEntity = getEntity(newState.entities, 'MY_SECOND_COMPONENT');

    expect(firstEntity).toBeDefined();
    expect(secondEntity).toBeDefined();
    if (!firstEntity) { return; }

    expect(firstEntity.fieldNumber).toEqual(myInitialConfiguration.fieldNumber);
    if (!secondEntity) { return; }

    expect(secondEntity.secondNumber).toEqual(mySecondUpdateConfiguration.secondNumber);
  });

  it('UPDATE_ENTITY should update the configuration with a partial one', () => {
    const state = configurationAdapter.addOne({id: 'MY_COMPONENT_TEST_CONFIG', ...myInitialConfiguration}, configurationInitialState);
    const newState = configurationReducer(state, updateConfigurationEntity({id: 'MY_COMPONENT_TEST_CONFIG', configuration: myPartialUpdateConfiguration}));

    expect(newState.ids).toEqual(['MY_COMPONENT_TEST_CONFIG']);
    const entity = getEntity(newState.entities, 'MY_COMPONENT_TEST_CONFIG');

    expect(entity).toBeDefined();
    if (!entity) {
      return;
    }

    expect(entity.fieldNumber).toEqual(myPartialUpdateConfiguration.fieldNumber);
    expect(entity.fieldString).toEqual(myInitialConfiguration.fieldString);
  });

  it('UPDATE_ENTITIES should update the configuration for multiple components', () => {
    const state = configurationAdapter.addMany(componentsConfigurationsModel, configurationInitialState);
    const newState = configurationReducer(state, updateConfigurationEntities({entities: updatedComponentsConfiguration}));
    const firstEntity = getEntity(newState.entities, 'MY_COMPONENT_TEST_CONFIG');
    const secondEntity = getEntity(newState.entities, 'MY_SECOND_COMPONENT');

    expect(firstEntity).toBeDefined();
    expect(secondEntity).toBeDefined();
    if (!firstEntity) { return; }

    expect(firstEntity.fieldNumber).toEqual(myInitialConfiguration.fieldNumber);
    if (!secondEntity) { return; }

    expect(secondEntity.secondNumber).toEqual(mySecondUpdateConfiguration.secondNumber);
  });

  it('UPSERT_ENTITY should add a configuration if not found', () => {
    const state = configurationReducer(configurationInitialState, upsertConfigurationEntity({id: 'MY_COMPONENT_TEST_CONFIG', configuration: myInitialConfiguration}));

    expect(state.ids).toEqual(['MY_COMPONENT_TEST_CONFIG']);
    const entity = getEntity(state.entities, 'MY_COMPONENT_TEST_CONFIG');

    expect(entity).toBeDefined();
    if (!entity) {
      return;
    }

    expect(entity.fieldNumber).toEqual(myInitialConfiguration.fieldNumber);
  });

  it('UPSERT_ENTITY should update the configuration if it is already in the entities', () => {
    const state = configurationAdapter.addOne({id: 'MY_COMPONENT_TEST_CONFIG', ...myInitialConfiguration}, configurationInitialState);
    const newState = configurationReducer(state, upsertConfigurationEntity({id: 'MY_COMPONENT_TEST_CONFIG', configuration: myUpdateConfiguration}));

    expect(newState.ids).toEqual(['MY_COMPONENT_TEST_CONFIG']);
    const entity = getEntity(newState.entities, 'MY_COMPONENT_TEST_CONFIG');

    expect(entity).toBeDefined();
    if (!entity) {
      return;
    }

    expect(entity.fieldNumber).toEqual(myUpdateConfiguration.fieldNumber);
  });

  it('CLEAR_ENTITIES should clear the configuration entities', () => {
    const state = configurationReducer(configurationInitialState, upsertConfigurationEntity({id: 'MY_COMPONENT_TEST_CONFIG', configuration: myInitialConfiguration}));

    expect(state.ids.length).toEqual(1);
    const newState = configurationReducer(state, clearConfigurationEntities());

    expect(newState.ids.length).toEqual(0);
  });
});
