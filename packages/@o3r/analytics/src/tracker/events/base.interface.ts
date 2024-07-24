export type AvailableAnalyticsType = 'event' | 'custom';

export type AnalyticsCustomActionType = `_${string}`;

export type AnalyticsWellKnownDomActionType = 'focus' | 'click';
export type AnalyticsWellKnownActionType = 'pageView' | 'exception' | AnalyticsWellKnownDomActionType;
export type AnalyticsAvailableActions = AnalyticsWellKnownActionType | AnalyticsCustomActionType;

interface BaseAnalyticsEvent<A extends AnalyticsAvailableActions = AnalyticsAvailableActions> {
  type: 'event';
  action: A;
  value?: any;
}

interface BaseAnalyticsDomEvent<A extends AnalyticsWellKnownDomActionType> extends BaseAnalyticsEvent<A> {
  label?: string;
  event?: any;
  category: string;
}

export type AnalyticsClickEvent = BaseAnalyticsDomEvent<'click'>;
export type AnalyticsFocusEvent = BaseAnalyticsDomEvent<'focus'>;

export interface AnalyticsPageViewEvent extends BaseAnalyticsEvent<'pageView'> {
  title?: string;
  location?: string;
}

export interface AnalyticsExceptionEvent extends BaseAnalyticsEvent<'exception'> {
  description?: string;
  fatal?: boolean;
}

export type AnalyticsGenericEvent<E extends AnalyticsCustomActionType = AnalyticsCustomActionType> = BaseAnalyticsEvent<E>;

export type AnalyticsAvailableEvents = AnalyticsClickEvent
  | AnalyticsFocusEvent
  | AnalyticsPageViewEvent
  | AnalyticsGenericEvent
  | AnalyticsExceptionEvent;

export interface ReportedEvent<E extends BaseAnalyticsEvent = AnalyticsAvailableEvents> {
  report: E;
  reportedAt: number;
}
