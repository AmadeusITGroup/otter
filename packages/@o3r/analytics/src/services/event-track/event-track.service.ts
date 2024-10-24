/* eslint-disable @typescript-eslint/naming-convention -- naming convention for DOM, FP, and FMP imposed by Lighthouse */
import type {
  Mark
} from '@ama-sdk/core';
import {
  Inject,
  Injectable,
  NgZone,
  Optional
} from '@angular/core';
import {
  NavigationEnd,
  Router
} from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  Observable,
  ReplaySubject
} from 'rxjs';
import {
  delay,
  filter,
  skip,
  skipWhile,
  take,
  takeWhile,
  withLatestFrom
} from 'rxjs/operators';
import {
  CustomEventMarks,
  CustomEventPayload,
  EventTiming,
  FirstLoadDataPayload,
  PerfEventPayload,
  ServerCallMetric,
  UiEventPayload
} from '../../contracts';
import {
  defaultEventTrackConfiguration,
  EVENT_TRACK_SERVICE_CONFIGURATION,
  EventTrackConfiguration
} from './event-track.configuration';

/** The initial value of the performance measurements */
export const performanceMarksInitialState: PerfEventPayload = {
  page: '',
  perceived: {},
  serverCalls: [],
  customMarks: []
};

/**
 * Service to expose the tracked events as streams. Also provide a way to activate/deactivate the tracking
 */
@Injectable(
  { providedIn: 'root' }
)
export class EventTrackService {
  private readonly uiEventTrack: ReplaySubject<UiEventPayload>;

  private readonly customEventTrack: ReplaySubject<CustomEventPayload>;

  private readonly perfEventTrack: ReplaySubject<PerfEventPayload>;

  private readonly uiTrackingActivated: BehaviorSubject<boolean>;

  private readonly perfTrackingActivated: BehaviorSubject<boolean>;

  private firstPaint?: Promise<EventTiming>;

  /** UI captured events as stream */
  public uiEventTrack$: Observable<UiEventPayload>;

  /** Custom captured events as stream */
  public customEventTrack$: Observable<CustomEventPayload>;

  /** Performance captured events as stream */
  public perfEventTrack$: Observable<PerfEventPayload>;

  /** Stream of booleans for the ui tracking mode active/inactive */
  public uiTrackingActive$: Observable<boolean>;

  /** Stream of booleans for the performance tracking mode active/inactive */
  public perfTrackingActive$: Observable<boolean>;

  /** True if the perf tracking is activated; false otherwise */
  private isPerfTrackingActive!: boolean;

  /** Boolean to indicate the first load of the application */
  private isFirstLoad = true;

  private _performancePayload: PerfEventPayload = performanceMarksInitialState;
  /** Performance payload object */
  private get performancePayload() {
    return this._performancePayload;
  }

  /** Performance payload object */
  private set performancePayload(value: PerfEventPayload) {
    if (this.isPerfTrackingActive) {
      this._performancePayload = { ...value, page: this.router.url }; // Saves the current page url
      this.perfEventTrack.next(this._performancePayload);
    }
  }

  constructor(private readonly router: Router, private readonly zone: NgZone, @Optional() @Inject(EVENT_TRACK_SERVICE_CONFIGURATION) config?: EventTrackConfiguration) {
    const eventConfiguration = { ...defaultEventTrackConfiguration, ...config };
    this.uiTrackingActivated = new BehaviorSubject<boolean>(eventConfiguration.activate.uiTracking);
    this.uiTrackingActive$ = this.uiTrackingActivated.asObservable();
    this.uiEventTrack = new ReplaySubject<UiEventPayload>(eventConfiguration.uiEventsBufferSize);
    this.uiEventTrack$ = this.uiEventTrack.asObservable();

    // Custom events
    this.customEventTrack = new ReplaySubject<CustomEventPayload>();
    this.customEventTrack$ = this.customEventTrack.asObservable();

    this.perfTrackingActivated = new BehaviorSubject<boolean>(eventConfiguration.activate.perfTracking);
    this.perfTrackingActive$ = this.perfTrackingActivated.asObservable();
    this.perfEventTrack = new ReplaySubject<PerfEventPayload>(eventConfiguration.perfBufferSize);
    this.perfEventTrack$ = this.perfEventTrack.asObservable();

    this.perfTrackingActive$.subscribe((activated) => this.isPerfTrackingActive = activated);

    const routerNavigationEnd$ = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd));
    const trackingNavigationEnd$ = routerNavigationEnd$.pipe(withLatestFrom(this.perfTrackingActive$));

    // Handles first load navigation
    combineLatest(
      trackingNavigationEnd$.pipe(
        take(1),
        filter(() => typeof window.performance.timing !== 'undefined'),
        takeWhile(([_event, active]) => active)
      ),
      fromEvent(window, 'load').pipe(delay(0))
    ).subscribe(async () => {
      if (eventConfiguration.useBrowserApiForFirstFP) {
        const browserEntries = window.performance.getEntriesByType && window.performance.getEntriesByType('paint');
        const browserFP = browserEntries && browserEntries.find((entry) => entry.name === 'first-paint');
        if (browserFP) {
          const endTime = Math.round(browserFP.startTime);
          this.addFPToPerfPayload({ startTime: 0, endTime });
        }
      } else if (this.firstPaint) { // If there is a registered firstPaint value emit it
        this.addFPToPerfPayload(await this.firstPaint);
        this.firstPaint = undefined;
      }
      this.markFirstLoad();
    });

    // Handles later navigation
    trackingNavigationEnd$.pipe(
      skip(1),
      skipWhile(([_event, active]) => !active)
    ).subscribe(async () => {
      this.isFirstLoad = false;
      this.resetPerfMarks();
      if (this.firstPaint) { // If there is a registered firstPaint value emit it
        this.addFPToPerfPayload(await this.firstPaint);
        this.firstPaint = undefined;
      }
    });
  }

  /**
   * Create metrics object for the first load of the application
   */
  private createFirstLoadData(): FirstLoadDataPayload {
    const navigation = window.performance.timing;
    return {
      connection: Math.round(navigation.connectEnd - navigation.navigationStart),
      request: Math.round(navigation.responseStart - navigation.connectEnd),
      response: Math.round(navigation.responseEnd - navigation.responseStart),
      DOM: Math.round(navigation.loadEventEnd - navigation.responseEnd),
      total: Math.round(navigation.loadEventEnd - navigation.navigationStart)
    };
  }

  /**
   * Populate performance payload with FP object
   * @param FP
   */
  private addFPToPerfPayload(FP: EventTiming) {
    const perfFirstPaint = {
      ...this.performancePayload,
      perceived: {
        ...this.performancePayload.perceived,
        FP
      }
    };
    this.performancePayload = perfFirstPaint;
  }

  /**
   * Reset all metrics to initial state; Add the pageName on top of it
   */
  public resetPerfMarks() {
    this.performancePayload = { ...performanceMarksInitialState };
  }

  /**
   * Mark the first load metrics using the navigation API.
   * This has to be called only once in a single page application, being meaningful only for the first load
   * This mark is populated by default in this service when the NavigationEnd event of the router emits for the first time
   */
  public markFirstLoad() {
    const firstLoad = this.createFirstLoadData();
    this.performancePayload = { ...this.performancePayload, firstLoad };
  }

  /**
   * Mark the first paint value
   * Store the first paint timing value to be emitted at Navigation End
   * @param emit If true, sets the FP to the current page. Otherwise, wait for next NavigationEnd event to happen
   */
  public async markFP(emit = false) {
    this.firstPaint = this.getTiming();
    if (emit) {
      this.addFPToPerfPayload(await this.firstPaint);
      this.firstPaint = undefined;
    }
  }

  /**
   * Mark the first meaningful paint value.
   * @param markOnlyFirstLoad If false, marks the FMP for subsequent loads else only for the first load of the application
   */
  public async markFMP(markOnlyFirstLoad = true) {
    if (!markOnlyFirstLoad || (markOnlyFirstLoad && this.isFirstLoad)) {
      const timing = await this.getTiming();
      const perfFirstMeaningfulPaint = {
        ...this.performancePayload,
        perceived: {
          ...this.performancePayload.perceived,
          FMP: timing
        }
      };
      this.performancePayload = perfFirstMeaningfulPaint;
    }
  }

  /**
   * Add data ready perceived event
   * This probe marks the time when the page considers it has all the data to become interactive
   */
  public async markDataReady() {
    const timing = await this.getTiming();
    const perfDataReady = {
      ...this.performancePayload,
      perceived: {
        ...this.performancePayload.perceived,
        dataReady: timing
      }
    };
    this.performancePayload = perfDataReady;
  }

  /**
   * Add a custom event and its measurements
   * @param label The event name
   */
  public async addCustomMark(label: string) {
    const timing = await this.getTiming();
    const customMark: CustomEventMarks = { label, timing };
    const perf = { ...this.performancePayload, customMarks: this.performancePayload.customMarks.concat(customMark) };
    this.performancePayload = perf;
  }

  /**
   * Add a server call object in the list of server calls metrics
   * @param serverCall The object to add in the server calls metrics
   */
  public addServerCallMark(serverCall: ServerCallMetric) {
    const perf = { ...this.performancePayload, serverCalls: this.performancePayload.serverCalls.concat(serverCall) };
    this.performancePayload = perf;
  }

  /**
   * Add a DxAPI SDK server call object, created by the SDK Probe plugin, in the list of server calls metrics.
   * In order to have requestId for the DxAPI calls, your server has to expose 'ama-request-id' via Access-Control-Expose-Headers
   * @param serverMark The mark object
   */
  public async addSDKServerCallMark(serverMark: Mark) {
    let serverCallMetric: ServerCallMetric = {
      url: serverMark.url,
      httpMethod: serverMark.requestOptions.method,
      httpStatus: serverMark.response && serverMark.response.status,
      timing: { startTime: serverMark.startTime, endTime: serverMark.endTime },
      error: serverMark.error
    };
    if (serverMark.response) {
      const clonedResponse = serverMark.response.clone();
      const amaRequestId = clonedResponse.headers.get('ama-request-id');
      const blob = await clonedResponse.blob();
      serverCallMetric = {
        ...serverCallMetric,
        responseSize: blob.size,
        requestId: amaRequestId || undefined
      };
    }
    this.addServerCallMark(serverCallMetric);
  }

  /**
   * Add a custom event and mark the start time, and returns the element index
   * @param label Event name
   * @returns the element index if tracking is active. Otherwise, -1
   */
  public startCustomMark(label: string) {
    if (!this.isPerfTrackingActive) {
      return -1;
    }
    const startTime = Math.round(window.performance.now());
    const customMark: CustomEventMarks = { label, timing: { startTime } };
    const perf = { ...this.performancePayload, customMarks: this.performancePayload.customMarks.concat(customMark) };
    this.performancePayload = perf;
    return this.performancePayload.customMarks.length - 1;
  }

  /**
   * End the event mark given in parameter;
   * Returns false if the custom event is not found in the list of custom marks; true otherwise
   * @param eventIndex Index of the custom event to be marked as ended
   */
  public endCustomMark(eventIndex: number) {
    if (!this.isPerfTrackingActive) {
      return false;
    }
    let updated = false;
    const perf = {
      ...this.performancePayload,
      customMarks: this.performancePayload.customMarks.map((eventObj, index) => {
        if (index !== eventIndex) {
          return eventObj;
        }
        updated = true;
        const endTime = Math.round(window.performance.now());
        return { label: eventObj.label, timing: { ...eventObj.timing, endTime } };
      })
    };
    this.performancePayload = perf;
    return updated;
  }

  /**
   * The goal of this method is to compute a time range duration between the moment you call the function (lower bound timestamp)
   * and the end of the composite rendering (upper bound measurement - a time mark that occurs after the real composite)
   * For the first load of the application, the start time is considered as the start of navigation to ensure a cumulative measure.
   * It is using the 'NgZone' service to runOutsideAngular to prevent any change detection to occur, nor angular error handling, speeding up the measurement.
   * Example {@link markFMP} is called in {@link ngAfterViewInit}, the end time will be computed once the render pipeline stage completed the changes triggered by the javascript
   */
  public getTiming(): Promise<EventTiming> {
    const startTime = this.isFirstLoad ? 0 : Math.round(window.performance.now());
    return new Promise((resolve) => {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          const endTime = Math.round(window.performance.now());
          resolve({ startTime, endTime });
        }, 0);
      });
    });
  }

  /**
   * Add an event to the stream of captured UI events
   * @param uiEvent emitted event object
   */
  public addUiEvent(uiEvent: UiEventPayload) {
    this.uiEventTrack.next(uiEvent);
  }

  /**
   * Add an event to the stream of captured custom events
   * @param customEvent emitted event object
   */
  public addCustomEvent(customEvent: CustomEventPayload) {
    this.customEventTrack.next(customEvent);
  }

  /**
   * Activate/deactivate the tracking mode for UI events
   * @param activate activation/deactivation boolean
   */
  public toggleUiTracking(activate: boolean) {
    this.uiTrackingActivated.next(activate);
  }

  /**
   * Activate/deactivate the tracking mode for performance measurements
   * @param activate activation/deactivation boolean
   */
  public togglePerfTracking(activate: boolean) {
    this.perfTrackingActivated.next(activate);
  }
}
