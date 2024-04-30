/**
 * Reviver: ApiResponse
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { ApiResponse } from './api-response';
import { ReviverOptions } from '@ama-sdk/core';

export function reviveApiResponse<T extends ApiResponse = ApiResponse>(data: undefined, dictionaries?: any, options?: ReviverOptions): undefined;
export function reviveApiResponse(data: ApiResponse, dictionaries?: any, options?: ReviverOptions): ApiResponse ;
export function reviveApiResponse(data: any, dictionaries?: any, options?: ReviverOptions): ApiResponse | undefined;
export function reviveApiResponse<T extends ApiResponse>(data: T, dictionaries?: any, options?: ReviverOptions): T ;
export function reviveApiResponse<T extends ApiResponse>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined;
/**
 *
 */
export function reviveApiResponse<T extends ApiResponse = ApiResponse>(data: any, dictionaries?: any, options?: ReviverOptions): T | undefined {
  if (!data) { return ; }
  return data as T;
}
