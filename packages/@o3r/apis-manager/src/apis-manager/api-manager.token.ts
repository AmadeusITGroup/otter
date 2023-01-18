import { InjectionToken } from '@angular/core';
import { ApiManager } from './api-manager';

/**
 * Token used internally by the core library to provide an Api manager to services.
 */
export const INTERNAL_API_TOKEN = new InjectionToken<ApiManager>('API manager token');

/**
 * Token used by the core library to provide an Api manager to services. It can be provided in the app.
 */
export const API_TOKEN = new InjectionToken<ApiManager>('Custom API manager token');
