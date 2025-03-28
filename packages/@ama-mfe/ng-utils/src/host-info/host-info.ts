import {
  InjectionToken,
} from '@angular/core';
import {
  MFE_HOST_APPLICATION_ID_PARAM,
  MFE_HOST_URL_PARAM,
} from '../utils';

const SESSION_STORAGE_KEY = 'ama-mfe-host-info';

/**
 * Information about the host in embedded context
 */
export interface MFEHostInformation {
  /**
   * URL of the host application
   */
  hostURL: string;
  /**
   * ID of the host application
   */
  hostApplicationId: string;
}

/**
 * Injectable used to get the host information
 */
export const MFE_HOST_INFO_TOKEN = new InjectionToken<MFEHostInformation>('MFE_HOST_INFO');

/**
 * Provider used to gather the host information from the url parameters and handle the persistence in session storage.
 */
export function provideHostInfo() {
  const searchParams = new URLSearchParams(location.search);
  const storedHostInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}') as MFEHostInformation;
  const hostInfo = {
    hostURL: searchParams.get(MFE_HOST_URL_PARAM) || storedHostInfo.hostURL,
    hostApplicationId: searchParams.get(MFE_HOST_APPLICATION_ID_PARAM) || storedHostInfo.hostApplicationId
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(hostInfo));

  return [
    { provide: MFE_HOST_INFO_TOKEN, useValue: hostInfo }
  ];
}
