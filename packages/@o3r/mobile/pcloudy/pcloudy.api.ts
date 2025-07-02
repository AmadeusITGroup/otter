import * as fs from 'node:fs';
import * as FormData from 'form-data';
import fetch from 'node-fetch';
import {
  Logger,
} from 'winston';
import {
  AppFile,
  Device,
  PCloudyResponse,
} from './pcloudy.interfaces';

/**
 * Class to interact with pCloudy API
 * Allow the user to authenticate, manage their devices and their application on the cloud
 * Each interaction should start with an authentication
 * Authentication token is managed within the class
 */
export class PCloudyApi {
  private readonly token$: Promise<string>;
  private readonly server: string;
  private readonly logger: Logger;

  constructor(logger: Logger, userName: string, apiKey: string, server = 'https://device.pcloudy.com') {
    this.server = server;
    this.logger = logger;
    this.token$ = this.authenticate(userName, apiKey);
  }

  /**
   * Perform POST call to the API - Cannot be used to upload a file
   * @param endpoint
   * @param body
   * @private
   */
  private async postCallToPCloudy<T>(endpoint: string, body: { [key: string]: any }): Promise<PCloudyResponse<T>> {
    const token = await this.token$;
    this.logger.debug('Request to ' + this.server + endpoint, body);
    if (!token) {
      throw new Error('No token of authentication detected, please start with authentication');
    }
    const { result } = await (await fetch(
      `${this.server}${endpoint}`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, token })
      })).json() as { result: PCloudyResponse<T> };
    if (result.code !== 200) {
      throw new Error(`Call to ${this.server}${endpoint} failed with error code ${result?.error || 'undefined'}`);
    }
    this.logger.debug(`Successful response received from ${this.server}${endpoint}`, result);
    return result;
  }

  /**
   * Authenticate using your account username and apiKey
   * You can find them on your pCloudy account
   * @param username
   * @param apiKey
   */
  public async authenticate(username: string, apiKey: string): Promise<string> {
    this.logger.debug(`Request authentication for ${username}`);
    const { result } = await (
      await fetch(`${this.server}/api/access`, {
        headers: {
          Authorization: 'Basic ' + Buffer.from(username + ':' + apiKey).toString('base64')
        }
      })).json() as { result: { code: number; token: string } };
    if (result && result.code === 200 && result.token) {
      this.logger.debug('User has been successfully authenticated', result);
      return result.token;
    } else {
      throw new Error(`Invalid response for ${this.server}/authentication - code ${result?.code}`);
    }
  }

  /**
   * Fetch the list of available devices to book for your automation or manual use
   * @param devicePlatform
   * @param availabilityDuration
   */
  public async getDeviceList(devicePlatform: 'android' | 'ios', availabilityDuration = 10): Promise<Device[]> {
    const result = await this.postCallToPCloudy<{ models: Device[] }>('/api/devices', {
      platform: devicePlatform,
      available_now: true,
      duration: availabilityDuration
    });
    return result.models || [];
  }

  // Manual testing
  /**
   * Book a device for manual testing.
   * @param device
   * @param bookDuration
   * @returns the reservation id that can be used to relinquish or to retrieve the url to access the device
   */
  public async bookDevice(device: Device, bookDuration = 10): Promise<number> {
    const result = await this.postCallToPCloudy<{ rid: number }>('/api/book_device', {
      id: device.id,
      duration: bookDuration
    });
    return result.rid;
  }

  /**
   * Install an application previously uploaded on pCloudy {@link uploadApp} on a device booked for manual testing
   * @param rid Reservation ID returned by the {@link bookDevice} method
   * @param appFileName Name (with extension) under which your application has been uploaded
   */
  public async installAndLaunchApp(rid: number, appFileName: string): Promise<string> {
    const result = await this.postCallToPCloudy<{ package: string; msg: string }>(
      '/api/install_app', {
        rid,
        filename: appFileName
      });
    return result.package;
  }

  /**
   * Retrieve the url to perform manual testing on a pCloudy device
   * @param rid Reservation id returned by {@link bookDevice}
   */
  public async getDevicePageUrl(rid: number): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by PCloudy
    const result = await this.postCallToPCloudy<{ URL: string }>('/api/get_device_url', { rid });
    return result.URL;
  }

  // Apps management
  /**
   * Retrieve the list of applications uploaded under your username on pCloudy
   * @param devicePlatform android or ios - used to filter our irrelevant applications
   * @param limit maximum application returned
   */
  public async getApps(devicePlatform?: string, limit = 20): Promise<AppFile[]> {
    const result = await this.postCallToPCloudy<{ files: AppFile[] }>(
      '/api/drive', {
        filter: (!devicePlatform && 'all') || (devicePlatform === 'android' && 'apk') || 'ipa',
        limit
      });
    return result.files || [];
  }

  /**
   * Upload an application on pCloudy under its filename
   * If an application is already on pCloudy, will save it under a different name
   * @param filePath
   * @returns file name in the cloud
   */
  public async uploadApp(filePath: string): Promise<string> {
    const token = await this.token$;
    const formData = new FormData();
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} does not exist`);
    }
    Object.entries({
      token,
      file: fs.createReadStream(filePath),
      filter: 'all',
      source_type: 'raw'
    }).forEach(([key, value]) => formData.append(key, value));
    this.logger.debug('Upload of application', filePath);

    const { result } = await (
      await fetch(
        `${this.server}/api/upload_file`, {
          method: 'post',
          body: formData
        })
    )?.json() as { result: { error?: string; file: string } };
    if (result?.error) {
      throw new Error(`Failed to upload the file - ${result.error}`);
    }
    this.logger.debug(`Successful response receive from ${this.server}/api/upload_file`, result);
    return result?.file;
  }

  /**
   * Delete an application from pCloudy
   * @param filename
   */
  public async deleteApp(filename: string) {
    await this.postCallToPCloudy('/api/delete_file', {
      dir: 'data',
      filter: 'all',
      filename
    });
  }

  /**
   * Sign your iOS application under pCloudy signing mechanism
   * This step is mandatory to install your .ipa files on pCloudy device
   * @param filename
   * @returns the token to follow the process
   */
  public async resignIosApp(filename: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by PCloudy
    const result = await this.postCallToPCloudy<{ resign_token: string }>('/api/resign/initiate', {
      filename
    });
    return result.resign_token;
  }

  /**
   * Check the progress of the re-signing performed in {@link resignIosApp}
   * @param filename
   * @param resignToken
   */
  public async getAppResigningProgress(filename: string, resignToken: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by PCloudy
    const result = await this.postCallToPCloudy<{ resign_status: number }>('/api/resign/progress', {
      filename,
      resign_token: resignToken
    });
    return result.resign_status;
  }

  /**
   * Download the pCloudy re-signed app to the pCloudy cloud.
   * Make it available for installation on pCloudy device
   * @param filename of the original app
   * @param resignToken returned by {@link resignIosApp}
   */
  public async downloadResignedApp(filename: string, resignToken: string) {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by PCloudy
    const result = await this.postCallToPCloudy<{ resign_file: string }>('/api/resign/download', {
      filename,
      resign_token: resignToken
    });
    return result.resign_file;
  }
}
