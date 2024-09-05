import { createSelector } from '@ngrx/store';
import { Configuration } from '@o3r/core';
import { configurationAdapter } from './configuration.reducer';
import { CONFIGURATION_STORE_NAME, ConfigurationState, globalConfigurationId } from './configuration.state';

const {selectIds, selectEntities, selectAll, selectTotal} = configurationAdapter.getSelectors();

/**
 * Select Configuration State
 * Note: the usage of createSelector is to avoid warning printing because of potentially undefined feature store
 */
export const selectConfigurationState = createSelector<{[CONFIGURATION_STORE_NAME]: ConfigurationState }, [state: ConfigurationState | undefined], ConfigurationState | undefined>(
  (state) => state[CONFIGURATION_STORE_NAME],
  (state) => state
);

/** Select the array of Configuration ids */
export const selectConfigurationIds = createSelector(selectConfigurationState, (state) => state ? selectIds(state) : []);

/** Select the array of Configuration */
export const selectAllConfiguration = createSelector(selectConfigurationState, (state) => state ? selectAll(state) : []);

/** Select the dictionary of Configuration entities */
export const selectConfigurationEntities = createSelector(selectConfigurationState, (state) => state ? selectEntities(state) : {});

/** Select the total Configuration count */
export const selectConfigurationTotal = createSelector(selectConfigurationState, (state) => state ? selectTotal(state) : 0);

/**
 * Select the configuration for component with id
 * @param props property of the selector
 * @param props.id id of the component
 */
export const selectConfigurationForComponent = <T extends Configuration>(props: {id: string}) =>
  createSelector(selectConfigurationEntities, (entities) => (entities?.[props.id] || {}) as Configuration as T);

/**
 * Select the global configuration
 */
export const selectGlobalConfiguration = createSelector(selectConfigurationForComponent({ id: globalConfigurationId }), (config) => config);
