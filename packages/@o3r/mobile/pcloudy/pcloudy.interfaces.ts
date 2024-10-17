/* eslint-disable @typescript-eslint/naming-convention */


/**
 * File stored on the pCloudy cloud.
 * File can be installed on your application.
 */
export interface AppFile {
  file: string;
  size_KB: number;
  time_UTC: string;
  extension: string;
  appendFolderPath: string;
}

/**
 * Remote device made available by pCloudy
 */
export interface Device {
  index: number;
  full_name: string;
  id: number;
  alias_name: string;
  model: string;
  display_name: string;
  platform: string;
  version: string;
  cpu: string;
  bucket: number;
  manufacturer: string;
  mobile_number: string;
  dpi: string;
  url: string;
  ram: number;
  resolution: string;
  display_area: number;
  available: boolean;
}


/**
 * Data related to your book device action (selected device; url to access the device and reservation id)
 */
export interface BookedData {
  selectedDevice: Device;
  rid: number;
  url: string;
}

/**
 * Properties returned in PCloudy responses for all the requests
 */
export interface PCloudyBaseResponse {
  token: string;
  code: number;
  error?: string;
}

/**
 * Response from PCloudy post api call.
 * @typeParam T the specific response data type expected for the call
 * @example To get application call will return the standard {@link PCloudyBaseResponse} and the application data
 * ```typescript
 * // The type shall be
 * PCloudyResponse<{files: AppFile[]}>
 * ```
 */
export type PCloudyResponse<T> = PCloudyBaseResponse & T;
