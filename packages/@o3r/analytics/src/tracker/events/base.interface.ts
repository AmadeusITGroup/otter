/** List of the Analytics types available */
export type AvailableAnalyticsType = 'event' | 'custom';

/**
 * Custom Action type not handle by the plugin.
 * It will passed directly to the different reporter without mapping according to the reporter
 */
export type AnalyticsCustomActionType = `_${string}`;

/** List of known Dom events */
export type AnalyticsWellKnownDomActionType = 'focus' | 'click';

/** List of known events */
export type AnalyticsWellKnownActionType = 'pageView' | 'exception' | AnalyticsWellKnownDomActionType;

/** List of possible actions to be emitted to the reporter */
export type AnalyticsAvailableActions = AnalyticsWellKnownActionType | AnalyticsCustomActionType;

interface BaseAnalyticsEvent<A extends AnalyticsAvailableActions = AnalyticsAvailableActions> {
  /** type of the Analytics message */
  type: 'event';
  /** Action of the event */
  action: A;
  /** Value attributed to the event */
  value?: any;
}

interface BaseAnalyticsDomEvent<A extends AnalyticsWellKnownDomActionType> extends BaseAnalyticsEvent<A> {
  /** Label of the event */
  label?: string;
  /** Name of the event to emit */
  event?: any;
  /** Category of the event */
  category: string;
}

/** Click event */
export type AnalyticsClickEvent = BaseAnalyticsDomEvent<'click'>;

/** Focus event */
export type AnalyticsFocusEvent = BaseAnalyticsDomEvent<'focus'>;

/** Page view event */
export interface AnalyticsPageViewEvent extends BaseAnalyticsEvent<'pageView'> {
  /** Title of the page */
  title?: string;
  /** URL of the page */
  location?: string;
}

/** Exception event */
export interface AnalyticsExceptionEvent extends BaseAnalyticsEvent<'exception'> {
  /** Description of the exception */
  description?: string;
  /** Determine if the exception cause a fatal error */
  fatal?: boolean;
}

/** Generic event */
export type AnalyticsGenericEvent<E extends AnalyticsCustomActionType = AnalyticsCustomActionType> = BaseAnalyticsEvent<E>;

/** Available events to be emitted to the reporter */
export type AnalyticsAvailableEvents = AnalyticsClickEvent
  | AnalyticsFocusEvent
  | AnalyticsPageViewEvent
  | AnalyticsGenericEvent
  | AnalyticsExceptionEvent;

/** Event as reported to the Analytics reporter */
export interface ReportedEvent<E extends BaseAnalyticsEvent = AnalyticsAvailableEvents> {
  /** Event to report to third party service */
  report: E;
  /** Timestamp of the event */
  reportedAt: number;
}
