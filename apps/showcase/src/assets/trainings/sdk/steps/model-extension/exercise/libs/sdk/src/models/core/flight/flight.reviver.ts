/* TODO Modify the implementation of reviveFlightFactory to call `baseRevive` and add an extra id */
import type { reviveFlight } from '../../base/flight/flight.reviver';

/**
 * Extended reviver for Flight
 *
 * @param baseRevive
 */
export function reviveFlightFactory<R extends typeof reviveFlight>(baseRevive: R) {
  return baseRevive;
}
