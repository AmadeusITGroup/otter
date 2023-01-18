import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CONFIG_OVERRIDE_STORE_NAME, ConfigOverrideState } from './config-override.state';

/** Select ConfigOverride State */
export const selectConfigOverrideState = createFeatureSelector<ConfigOverrideState>(CONFIG_OVERRIDE_STORE_NAME);

/** Select the array of ConfigOverride */
export const selectConfigOverride = createSelector(selectConfigOverrideState, (state) => state?.configOverrides || {});

/**
 * Get the override for given component identifier
 *
 * @param componentId
 * @returns
 */
export const selectComponentOverrideConfig =
  (componentId: string) => createSelector(selectConfigOverride, (configOverrides) => configOverrides[componentId] || {});
