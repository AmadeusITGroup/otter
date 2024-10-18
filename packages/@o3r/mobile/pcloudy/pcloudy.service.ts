import * as path from 'node:path';
import {
  Logger
} from 'winston';
import {
  PCloudyApi
} from './pcloudy.api';
import {
  BookedData
} from './pcloudy.interfaces';

export class PCloudyService {
  private readonly api: PCloudyApi;
  private readonly logger: Logger;

  constructor(api: PCloudyApi, logger: Logger) {
    this.api = api;
    this.logger = logger;
  }

  /**
   * Upload your application on pCloudy
   * If your application is already on the cloud, will only override it if your request it
   * @param applicationPath
   * @param override Replace application on the cloud if it is already on the cloud
   * @returns app name to be used in your automation tests
   */
  public async uploadApp(applicationPath: string, override: boolean): Promise<string> {
    const appName = path.parse(applicationPath).base;
    const platform = applicationPath.includes('.apk') ? 'android' : 'ios';
    const appAlreadyUpdated = (await this.api.getApps(platform)).find((app) => app.file === appName);
    if (override && appAlreadyUpdated) {
      this.logger.info('App already exists - Override will be requested');
      await this.api.deleteApp(appName);
    }
    if (override || !appAlreadyUpdated) {
      await this.api.uploadApp(applicationPath);
      this.logger.info('App has been successfully uploaded');
    } else {
      this.logger.info('App already on the cloud and no override requested. This step will be skipped');
    }
    if (platform === 'ios' && !appName.includes('Resigned')) {
      this.logger.info('Unsigned iOS app detected - re-signing will start...');
      const resignedAppName = await this.resignIOSApplication(appName);
      this.logger.info('Your re-signed app is available under ' + resignedAppName);
      return resignedAppName;
    }
    return appName;
  }

  /**
   * Delete an application from pCloudy
   * @param appName under which the application has been uploaded
   */
  public async deleteApp(appName: string) {
    await this.api.deleteApp(appName);
  }

  /**
   * Find the devices available for a platform
   * @throws Error if no available devices on pCloudy
   * @param devicePlatform
   * @param minVersion
   */
  public async getMatchingDevices(devicePlatform: 'android' | 'ios', minVersion = 0) {
    const devices = await this.api.getDeviceList(devicePlatform);
    if (devices.length === 0) {
      throw new Error('No device available');
    }
    this.logger.debug(`Looking for devices >= ${minVersion}`);

    const matchingDevices = devices.filter((d) => {
      return Number.parseInt(d.version.split('.')[0], 10) >= minVersion;
    });
    return matchingDevices;
  }

  /**
   * Book a device for manual testing - the device can be accessed via the url returned
   * @param devicePlatform
   * @param minVersion
   * @param duration
   */
  public async bookDevice(devicePlatform: 'android' | 'ios', minVersion?: number, duration?: number): Promise<BookedData | undefined> {
    const [selectedDevice] = await this.getMatchingDevices(devicePlatform, minVersion);
    // TODO include retry parameter
    const rid = await this.api.bookDevice(selectedDevice, duration);
    const url = await this.api.getDevicePageUrl(rid);
    return { selectedDevice, rid, url };
  }

  /**
   * Install and launch your application on the booked device ({@link bookDevice})
   * @param rid Reservation ID
   * @param appName
   */
  public async installApplicationAndLaunchDevice(rid: number, appName: string): Promise<void> {
    await this.api.installAndLaunchApp(rid, appName);
    this.logger.info(appName + ' has been successfully installed');
  }

  /**
   * Resign iOS application to install it on pCloudy devices
   * @param appName
   */
  public async resignIOSApplication(appName: string) {
    const resignId = await this.api.resignIosApp(appName);
    let progress = 0;
    let progressCheckInterval: any;
    let timeoutProgressCheck: any;
    const resigningProcessFinished = new Promise((resolve, reject) => {
      progressCheckInterval = setInterval(() =>
        this.api.getAppResigningProgress(appName, resignId).then((value) => {
          progress = value;
          if (progress === 100) {
            if (progressCheckInterval) {
              clearInterval(progressCheckInterval);
            }
            if (timeoutProgressCheck) {
              clearTimeout(timeoutProgressCheck);
            }
            this.logger.info('Your app re-signing process is done');
            resolve('Completed');
          }
        }), 1000);
      timeoutProgressCheck = setTimeout(() => {
        clearInterval(progressCheckInterval);
        if (progress < 100) {
          reject(`Failed to re-sign ios application ${appName} before timeout - progress stuck at ${progress}`);
        }
      }, 10_000);
    });
    await resigningProcessFinished;
    this.logger.info('Proceed to download the re-signed app on pCloudy');
    return (await this.api.downloadResignedApp(appName, resignId));
  }
}
