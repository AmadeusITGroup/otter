import { computeItemIdentifier } from '@o3r/core';
import type {Configuration, NestedConfiguration} from '@o3r/core';

/** Configuration of a destination */
export interface DestinationConfiguration extends NestedConfiguration {
  /**
   * Name of the destination's city
   * @o3rRequired
   */
  cityName: string;
  /**
   * Is the destination available
   */
  available: boolean;
}

/**
 * Component configuration example
 * @o3rCategories localCategory Local category
 */
export interface ConfigurationPresConfig extends Configuration {
  /**
   * Default date selected compare to today
   * @o3rCategory localCategory
   */
  inXDays: number;
  /**
   * Proposed destinations
   * @o3rWidget DESTINATION_ARRAY
   * @o3rWidgetParam minItems 1
   * @o3rWidgetParam allDestinationsDifferent true
   * @o3rWidgetParam atLeastOneDestinationAvailable true
   * @o3rWidgetParam destinationPattern "[A-Z][a-zA-Z-' ]+"
   */
  destinations: DestinationConfiguration[];
  /**
   * Propose round trip
   * @o3rCategory localCategory
   */
  shouldProposeRoundTrip: boolean;
}

export const CONFIGURATION_PRES_DEFAULT_CONFIG = {
  inXDays: 7,
  destinations: [
    { cityName: 'London', available: true },
    { cityName: 'Paris', available: true },
    { cityName: 'New-York', available: false }
  ],
  shouldProposeRoundTrip: false
} as const satisfies ConfigurationPresConfig;

export const CONFIGURATION_PRES_CONFIG_ID = computeItemIdentifier('ConfigurationPresConfig', 'showcase');
