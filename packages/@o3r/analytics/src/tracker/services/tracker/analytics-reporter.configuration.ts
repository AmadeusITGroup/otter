import {
  InjectionToken,
} from '@angular/core';
import type {
  AnalyticsThirdPartyService,
} from '../../third-party';

/** Configuration of the Analytics Reporter */
export interface AnalyticsReporterConfiguration {
  /** Size of the event stack to keep when no Analytics service registered */
  eventStackSize: number;
  /** Determine if the service is collecting analytics on the load of the service */
  activatedOnBootstrap: boolean;
  /** List of Analytics services to register on bootstrap of the service */
  registeredAnalyticsServicesOnBootstrap?: AnalyticsThirdPartyService[];
}

/** Default configuration */
export const defaultAnalyticsReporterConfiguration: AnalyticsReporterConfiguration = {
  eventStackSize: 10,
  activatedOnBootstrap: true
};

/** Token to inject configuration to the Analytics reporter */
export const ANALYTICS_REPORTER_CONFIGURATION = new InjectionToken<AnalyticsReporterConfiguration>('Configuration for the Analytics Tracker', { factory: () => defaultAnalyticsReporterConfiguration });
