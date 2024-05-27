import type {
  Logger,
} from '@o3r/core';
import type {
  ReportedEvent,
} from '../events';

/** Common options provided to the hooks */
export interface AnalyticsHookOptions {
  /** Logger */
  logger?: Logger;
}

/** Analytics Third Party service to register to the {@link AnalyticsEventReporter} */
export interface AnalyticsThirdPartyService {
  /** Hook called when the services has been registered to the {@link AnalyticsEventReporter} */
  onRegistration?: (options?: Partial<AnalyticsHookOptions>) => void | Promise<void>;
  /** Hook called when the the {@link AnalyticsEventReporter} ios activated. */
  onActivation?: (options?: Partial<AnalyticsHookOptions>) => void | Promise<void>;
  /** Hook called when the the {@link AnalyticsEventReporter} ios deactivated. */
  onDeactivation?: (options?: Partial<AnalyticsHookOptions>) => void | Promise<void>;
  /** Hook called by the {@link AnalyticsEventReporter} to emit an Analytics Event to the service implemented this interface */
  emit: (analyticsItem: ReportedEvent, options?: Partial<AnalyticsHookOptions>) => void | Promise<void>;
}
