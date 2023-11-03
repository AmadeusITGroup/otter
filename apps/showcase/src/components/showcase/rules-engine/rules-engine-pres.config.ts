import {computeConfigurationName} from '@o3r/configuration';
import type {Configuration, NestedConfiguration} from '@o3r/core';

/** Configuration of a destination */
export interface RulesEngineDestinationConfiguration extends NestedConfiguration {
  /**
   * IATA code of the destination's city
   * @o3rRequired
   */
  cityCode: string;
  /**
   * Is the destination available
   */
  available: boolean;
}

export interface RulesEnginePresConfig extends Configuration {
  /**
   * Default date selected compare to today
   */
  inXDays: number;
  /**
   * Proposed destinations
   */
  destinations: RulesEngineDestinationConfiguration[];
  /**
   * Propose round trip
   */
  shouldProposeRoundTrip: boolean;
}

export const RULES_ENGINE_PRES_DEFAULT_CONFIG: RulesEnginePresConfig = {
  inXDays: 7,
  destinations: [
    { cityCode: 'LON', available: true },
    { cityCode: 'PAR', available: true },
    { cityCode: 'NYC', available: false }
  ],
  shouldProposeRoundTrip: false
};

export const RULES_ENGINE_PRES_CONFIG_ID = computeConfigurationName('RulesEnginePresConfig', 'showcase');
