/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Category
 */
export interface Category {
  /** Primary category */
  primaryCategory: string;
  /** Sub category */
  subCategory?: string;
}

/**
 * The event information
 */
export interface EventInfo {
  /** Event key */
  key?: string;
  /** Event name */
  eventName: string;
  /** Page id */
  pageId?: string;
  /** Timestamp */
  timeStamp?: string;
  /** Product id */
  productId?: string;
  /** Component id */
  componentId?: string;
}

/**
 * An event attribute
 */
export interface Attribute {
  /** Attribute key */
  key: string;
  /** Attribute value */
  value: string;
  /** Attribute to defined if it is a sensitive data or not */
  isSensitiveData?: boolean;
}

/**
 * The event context
 */
export interface EventContext {
  /** Category */
  category?: Category;
  /** Event information */
  eventInfo: EventInfo;
  /** List of attribute */
  attributes?: Attribute[];
}

/**
 * Generic analytics event
 */
export interface AnalyticsEvent extends EventContext {}

/**
 * Generic model for the parameter of `ConstructorAnalyticsEvent`
 */
export interface ConstructorAnalyticsEventParameters {
  [key: string]: any;
}

/**
 * Type for AnalyticsEvent classes
 */
export type ConstructorAnalyticsEvent<T extends AnalyticsEvent> = new (parameters?: ConstructorAnalyticsEventParameters) => T;

/**
 * Dictionary of analytics events
 */
export interface AnalyticsEvents {
  [key: string]: ConstructorAnalyticsEvent<AnalyticsEvent>;
}

/**
 * Trackable item
 */
export interface Trackable<T extends AnalyticsEvents> {
  /**
   * Analytics events
   */
  readonly analyticsEvents: T;
}

/** The UI event object which will be emitted by event tracker service */
export interface UiEventPayload {
  /** The event which takes place in the DOM */
  nativeEvent: Event;
  /** The custom object with additional information about the event captured */
  context: EventContext;
}

/** The custom event object which will be emitted by event tracker service */
export interface CustomEventPayload {
  /** The custom object with additional information about the event captured */
  context: EventContext;
}

/** The event name which has to be tracked */
export type TrackEventName = keyof GlobalEventHandlersEventMap;

/**
 * Event timing marks
 * Those marks are meant to be used either as start and end of an event (e.g. a server call)
 * either as lower and upper bound for a specific mark (e.g. first paint)
 */
export interface EventTiming {
  /** Timestamp of the start of an event or lower bound for a time mark */
  startTime: number;
  /** Timestamp of the end of an event or upper bound for a time mark */
  endTime?: number;
}

/** Perceived events marks */
export interface PerceivedEvents {
  /**
   * Mark the time from the navigation start until the loading indicator triggers
   * {@link https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint|FP}
   */
  FP?: EventTiming;
  /**
   * Marks the time when the page appears to be meaningfully complete
   * This is essentially the paint after which the biggest above-the-fold layout change has happened, and web fonts have loaded.
   * {@link https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint|FMP}
   */
  FMP?: EventTiming;
  /** Marks the time when the page considers it has all the data to become interactive  */
  dataReady?: EventTiming;
}

/** Network metrics for a server call */
export interface ServerCallMetric {
  /** Request url */
  url: string;
  /** Http request method */
  httpMethod?: string;
  /** Time taken for a server call; Start time when the call has fired and end time when the call has finished */
  timing: EventTiming;
  /** Custom error object added for a request; ex. An error object when the network is down */
  error?: Error;
  /** Status code of the response  */
  httpStatus?: number;
  /** Size of the response in bytes */
  responseSize?: number;
  /** If available, it identifies the call with the server logs (e.g. ama-request-id for DxAPI calls) */
  requestId?: string;
}

/** Custom mark event added on a page */
export interface CustomEventMarks {
  /** Name of the metric needed */
  label: string;
  /** Time range taken for the added mark */
  timing: EventTiming;
}

/** Object structure for first load of the app */
export interface FirstLoadDataPayload {
  /** Time between navigation is triggered and the connection is opened to the network in ms */
  connection: number;
  /** Time between the connection is opened to the network (connectEnd) and the first byte of response is received (responseStart) in ms */
  request: number;
  /** The duration while the response is received in ms; from the first byte from response received to the last one */
  response: number;
  /** DOM loading. Time between browser resources received and DOM rendered in ms */
  DOM: number;
  /** The total page load time in ms */
  total: number;
}

/** The performance event object which will be emitted by event tracker service  for a page */
export interface PerfEventPayload {
  /** The page name (route or page code or naming convention) where the performance events are tracked */
  page: string;
  /** Marks for perceived events */
  perceived: PerceivedEvents;
  /** Marks for the first load of the app  */
  firstLoad?: FirstLoadDataPayload;
  /** Server calls in the page, excluding the resources calls */
  serverCalls: ServerCallMetric[];
  /** Custom marks added to the page */
  customMarks: CustomEventMarks[];
}
