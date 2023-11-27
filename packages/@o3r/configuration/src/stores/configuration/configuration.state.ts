import type { EntityState } from '@ngrx/entity';
import type { Configuration } from '@o3r/core';

/**
 * Configuration model
 */
export interface ConfigurationModel extends Configuration {
  id: string;
}

/**
 * Configuration store state
 */
export interface ConfigurationState extends EntityState<ConfigurationModel> {
}

/**
 * Name of the Configuration Store
 */
export const CONFIGURATION_STORE_NAME = 'configuration';

/**
 * Configuration Store Interface
 */
export interface ConfigurationStore {
  /** Configuration state */
  [CONFIGURATION_STORE_NAME]: ConfigurationState;
}
