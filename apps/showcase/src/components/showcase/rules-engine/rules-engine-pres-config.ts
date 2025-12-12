import {
  computeItemIdentifier,
} from '@o3r/core';
import type {
  Configuration,
  NestedConfiguration,
} from '@o3r/core';

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

export const RULES_ENGINE_PRES_DEFAULT_CONFIG: Readonly<RulesEnginePresConfig> = {
  inXDays: 7,
  destinations: [
    { cityCode: 'LON', available: true },
    { cityCode: 'PAR', available: true },
    { cityCode: 'NYC', available: false }
  ],
  shouldProposeRoundTrip: false
} as const;

export const RULES_ENGINE_PRES_CONFIG_ID = computeItemIdentifier('RulesEnginePresConfig', 'showcase');
