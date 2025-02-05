import { FlightCoreIfy, reviveFlightFactory } from '../../core/flight';
import type { Flight as BaseModel } from './flight';
import { reviveFlight as baseReviver } from './flight.reviver';

export type Flight = FlightCoreIfy<BaseModel>;
export const reviveFlight = reviveFlightFactory(baseReviver);
export type { BaseModel as BaseFlight };
