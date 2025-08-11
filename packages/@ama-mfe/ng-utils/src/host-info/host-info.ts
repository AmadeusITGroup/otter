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
 * Search parameter to add to the URL to identify the application in the network of peers in the communication protocol
 */
export const MFE_MODULE_APPLICATION_ID_PARAM = 'ama-mfe-module-app-id';

/** The list of query parameters which can be set by the host */
export const hostQueryParams = [MFE_HOST_URL_PARAM, MFE_HOST_APPLICATION_ID_PARAM, MFE_MODULE_APPLICATION_ID_PARAM];

/**
 * Information set up at host level to use in embedded context
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

  /**
   * ID of the module to embed defined at host level
   */
  moduleApplicationId?: string;
}

/**
 * Gather the host information from the url parameters
 * The host url will use the first found among:
 * - look for the search parameter {@link MFE_HOST_URL_PARAM} in the URL of the iframe
 * - use the first item in `location.ancestorOrigins` (currently not supported on Firefox)
 * - use `document.referrer` (will only work if called before any redirection in the iframe)
 * The host application ID is taken from the search parameter {@link MFE_HOST_APPLICATION_ID_PARAM} in the URL of the iframe
 * The module application ID is taken from the search parameter {@link MFE_APPLICATION_ID_PARAM} in the URL of the iframe
 * @param locationParam - optional parameter for testing purposes, defaults to `location`
 */
export function getHostInfo(locationParam: Location = location): MFEHostInformation {
  const searchParams = new URLSearchParams(locationParam.search);
  const storedHostInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}') as MFEHostInformation;
  return {
    hostURL: searchParams.get(MFE_HOST_URL_PARAM) || storedHostInfo.hostURL || locationParam.ancestorOrigins?.[0] || document.referrer,
    hostApplicationId: searchParams.get(MFE_HOST_APPLICATION_ID_PARAM) || storedHostInfo.hostApplicationId,
    moduleApplicationId: searchParams.get(MFE_MODULE_APPLICATION_ID_PARAM) || storedHostInfo.moduleApplicationId
  };
}

/**
 * Gather the host information from the url parameters and handle the persistence in session storage.
 */
export function persistHostInfo() {
  const hostInfo = getHostInfo();
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(hostInfo));
}
