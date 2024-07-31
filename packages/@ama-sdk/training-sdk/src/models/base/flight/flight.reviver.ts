/**
 * Reviver: Flight
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { Flight } from './flight';
import { utils,   type ReviverOptions, } from '@ama-sdk/core';

export function reviveFlight<T extends Flight = Flight>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveFlight(data: Flight, dictionaries?: any, options?: ReviverOptions): Flight ;
export function reviveFlight(data: any, dictionaries?: any, options?: ReviverOptions): Flight  | undefined;
export function reviveFlight<T extends Flight>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveFlight<T extends Flight>(data: any, dictionaries?: any, options?: ReviverOptions): T  | undefined;
export function reviveFlight<T extends Flight = Flight>(data: any, dictionaries?: any, options?: ReviverOptions): T  | undefined {
  if (!data) { return ; }
  data.departureDateTime = data.departureDateTime ? new utils.DateTime(data.departureDateTime) : undefined;
  data.paymentExpirationDate = data.paymentExpirationDate ? new Date(data.paymentExpirationDate) : undefined;
  return data as T;
}
