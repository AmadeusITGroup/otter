import {
  type ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  AnalyticsRouterTracker,
} from './router-tracker';
import {
  ANALYTICS_REPORTER_CONFIGURATION,
  AnalyticsEventReporter,
  type AnalyticsReporterConfiguration,
  defaultAnalyticsReporterConfiguration,
} from './tracker';

/** Configuration of the Analytics tracker nodule */
export type AnalyticsTrackerModuleOptions = {
  /**
   * Enable the Router tracker service
   * @default false
   */
  enableRouterTracker: boolean;
  /**
   * Configuration of the Analytics Tracker service. Will be merged with the {@link defaultAnalyticsReporterConfiguration}
   * @see AnalyticsReporterConfiguration
   */
  trackerConfig: Partial<AnalyticsReporterConfiguration>;
};

@NgModule()
export class AnalyticsTrackerModule {
  /**
   * Load the Analytics Tracker service on root level
   * @param config configuration of the Analytics service
   */
  public static forRoot(config?: Partial<AnalyticsTrackerModuleOptions>): ModuleWithProviders<AnalyticsTrackerModule> {
    const configuration = config?.trackerConfig ? { ...defaultAnalyticsReporterConfiguration, ...config.trackerConfig } : defaultAnalyticsReporterConfiguration;

    return {
      ngModule: AnalyticsTrackerModule,
      providers: [
        { provide: ANALYTICS_REPORTER_CONFIGURATION, useValue: configuration },
        AnalyticsEventReporter,
        ...(config?.enableRouterTracker ? [AnalyticsRouterTracker] : [])
      ]
    };
  }
}
