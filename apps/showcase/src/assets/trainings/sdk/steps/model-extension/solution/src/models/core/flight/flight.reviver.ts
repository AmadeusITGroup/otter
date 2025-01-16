import type { Flight } from '../../base/flight/flight';
import type { reviveFlight } from '../../base/flight/flight.reviver';
import type { FlightCoreIfy } from './flight';

/**
 * Extended reviver for Flight
 *
 * @param baseRevive
 */
export function reviveFlightFactory<R extends typeof reviveFlight>(baseRevive: R) {
  const reviver = <T extends Flight = Flight>(data: any, dictionaries?: any) => {
    const revivedData = baseRevive<FlightCoreIfy<T>>(data, dictionaries);
    if (!revivedData) { return; }
    /* Set the value of your new fields here */
    revivedData.id = 'sampleIdValue';
    return revivedData;
  };

  return reviver;
}
