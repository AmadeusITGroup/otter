/**
 * Reviver: ApiResponse
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 */
import { ApiResponse } from './api-response';

export function reviveApiResponse<T extends ApiResponse = ApiResponse>(data: undefined, dictionaries?: any): undefined;
export function reviveApiResponse(data: ApiResponse, dictionaries?: any): ApiResponse ;
export function reviveApiResponse(data: any, dictionaries?: any): ApiResponse | undefined;
export function reviveApiResponse<T extends ApiResponse>(data: T, dictionaries?: any): T ;
export function reviveApiResponse<T extends ApiResponse>(data: any, dictionaries?: any): T | undefined;
/**
 *
 */
export function reviveApiResponse<T extends ApiResponse = ApiResponse>(data: any, dictionaries?: any): T | undefined {
  if (!data) { return ; }
  return data as T;
}
