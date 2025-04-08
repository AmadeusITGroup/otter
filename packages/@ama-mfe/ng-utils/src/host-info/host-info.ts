import {
  InjectionToken,
} from '@angular/core';

const SESSION_STORAGE_KEY = 'ama-mfe-host-info';

/**
 * Search parameter to add to the URL when embedding an iframe containing the URL of the host.
 * This is needed to support Firefox (on which {@link https://developer.mozilla.org/docs/Web/API/Location/ancestorOrigins | location.ancestorOrigins} is not currently supported)
 * in case of redirection inside the iframe.
 */
export const MFE_HOST_URL_PARAM = 'ama-mfe-host-url';

/**
 * Search parameter to add to the URL to let a module know on which application it's embedded
 */
export const MFE_HOST_APPLICATION_ID_PARAM = 'ama-mfe-host-app-id';

/**
 * Information about the host in embedded context
 */
export interface MFEHostInformation {
  /**
   * URL of the host application
   */
  hostURL?: string;
  /**
   * ID of the host application
   */
  hostApplicationId?: string;
}

/**
 * Injectable used to get the host information
 */
export const MFE_HOST_INFO_TOKEN = new InjectionToken<MFEHostInformation>('MFE_HOST_INFO');

/**
 * Gather the host information from the url parameters
 * The host url will use the first found among:
 * - look for the search parameter {@link MFE_HOST_URL_PARAM} in the URL of the iframe
 * - use the first item in `location.ancestorOrigins` (currently not supported on Firefox)
 * - use `document.referrer` (will only work if called before any redirection in the iframe)
 * The application ID is taken from the search parameter {@link MFE_HOST_APPLICATION_ID_PARAM} in the URL of the iframe
 */
export function getHostInfo(): MFEHostInformation {
  const searchParams = new URLSearchParams(location.search);
  const storedHostInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}') as MFEHostInformation;
  return {
    hostURL: searchParams.get(MFE_HOST_URL_PARAM) || storedHostInfo.hostURL || location.ancestorOrigins?.[0] || document.referrer,
    hostApplicationId: searchParams.get(MFE_HOST_APPLICATION_ID_PARAM) || storedHostInfo.hostApplicationId
  };
}

/**
 * Provider used to gather the host information from the url parameters and handle the persistence in session storage.
 */
export function provideHostInfo() {
  const hostInfo = getHostInfo();
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(hostInfo));

  return [
    { provide: MFE_HOST_INFO_TOKEN, useValue: hostInfo }
  ];
}
