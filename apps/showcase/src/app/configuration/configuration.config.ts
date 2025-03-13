import {
  computeItemIdentifier,
} from '@o3r/core';
import type {
  Configuration,
} from '@o3r/core';

/**
 * Empty configuration for testing purpose
 */
export interface ConfigurationConfig extends Configuration {}

/**
 * Default value for `ConfigurationConfig`
 */
export const CONFIGURATION_DEFAULT_CONFIG: Readonly<ConfigurationConfig> = {} as const;

/**
 * Configuration id for `ConfigurationConfig`
 */
export const CONFIGURATION_CONFIG_ID = computeItemIdentifier('ConfigurationConfig', 'showcase');
