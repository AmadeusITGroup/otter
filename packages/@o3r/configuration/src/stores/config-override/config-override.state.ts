/**
 * Property override model
 */
export interface PropertyOverride {
  [property: string]: any;
}

/**
 * ConfigOverride store state
 */
export interface ConfigOverrideState {
  /** Map of PropertyOverride indexed on component + config name */
  configOverrides: Record<string, PropertyOverride>;
}

/**
 * Name of the ConfigOverride Store
 */
export const CONFIG_OVERRIDE_STORE_NAME = 'configOverride';

/**
 * ConfigOverride Store Interface
 */
export interface ConfigOverrideStore {
  /** ConfigOverride state */
  [CONFIG_OVERRIDE_STORE_NAME]: ConfigOverrideState;
}
