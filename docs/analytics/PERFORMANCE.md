# Performance metrics

There are several aspects of a web application that can impact its performance. Network conditions, CPU processing, server-side tasks are a few of them.
Checking how long it took to load the page is not enough to measure the application performances.
Quickly loading something that is not meaningful nor interactive means nothing to the user. That's why one must improve the load
time AND the perceived performance (aka how fast the user perceives the application).
Some of those metrics (load time related and perception metrics) are described below.

## Metrics

### First load

Mark the first load metrics using the [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming).
This has to be called only once in a single page application, as it is only meaningful for the initial page load. [FirstLoadDataPayload](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/contracts/events-contracts.ts)
interface is the model object for this mark.

### First paint ([FP](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint))

This is one of the first metrics for perceived performance. Basically, it measures the time the app takes to answer a
user's first question: Is something happening? Is the navigation successful ? Has the server responded?
The First Paint (FP) measures the time it takes from the start of the navigation to, for example, display the loading indication.

### First Meaningful Paint ([FMP](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint))

Also for perceived performance, FMP measures the time the app takes to render enough content for users to engage. A simple strategy for this metric is to mark what's called hero elements (most important
elements in the page) and register the delay to display them.

### Time to Interactive ([TTI](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive))

TTI marks the time when the user can effectively interact with the app. This is closely related to the fact that, in some implementations, the app may have rendered meaningful information
(measured by FMP) but, in the background, it's still doing some kind of computation that blocks any possible interaction with the page.

The time to interactive is quite tricky as it not only depends on the relevant data readiness, but also on
component internal display mechanics.
If you know exactly where javascript will trigger a layout change  (e.g. by passing a boolean variable to true), it's possible to measure the upper bound for the rendering.

In addition, during a component development, you can't possibly know beforehand if the component will be relevant for a TTI or not, since it depends on the page itself.
For example, the display of a cart component may be relevant for TTI in a given page and not relevant at all in others.
Hence, you cannot really define your TTI logic at component level.

Given the above facts, we advise to split the TTI metric in two:

* __dataReady__: This probe marks the time when all the data, needed to the page be interactive, is available
* __TTI per component__: data ready for each component; we advise to implement it later, since it may impact the complexity of the code

For the time being, we will consider only the implementation of __data ready__.

### Network and server-side metrics

As the browser can't understand when a route event happens in an SPA, the NavigationTimingAPI can't be directly used apart from the first page load at most.
Subsequent routing changes won't profit from the API connection timings.

In regard of the __server fetches__ (filter out from the resource timing API), the [PerformanceMetricPlugin](https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/core/src/plugins/perf-metric/perf-metric.fetch.ts)
has been put in place to get the metrics associated to server calls.
Check [ServerCallMetric](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/contracts/events-contracts.ts)
model to see which information is saved for each call.

## How to mark performance metrics?

The __EventTrackService__ plugs itself to the [NavigationEnd](https://angular.io/api/router/NavigationEnd) router, to handle the performance metrics and expose the performance object as a stream (observable).
The performance metric object structure is defined by __PerfEventPayload__ interface which can be found [here](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/contracts/events-contracts.ts).
The service provides a way to activate/deactivate performance measurements. By default, it's __activated__ and we expose a public method called __togglePerfTracking__ to activate/deactivate it.
For instance if you want to deactivate it, call this in your app:

```typescript
import {EventTrackService} from '@o3r/analytics';
...
constructor(trackService: EventTrackService) {
  trackService.togglePerfTracking(false);
}
```

### Tracking configuration

You can override the default configuration via a configuration token ([EVENT_TRACK_SERVICE_CONFIGURATION](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/services/event-track/event-track.configuration.ts)).
Example of configuration override:

```typescript
// in app module
  ...
  providers: [
    ...
    {provide: EVENT_TRACK_SERVICE_CONFIGURATION, useValue: {useBrowserApiForFirstFP: true}}
  ]
```

More details about the configuration object and [defaultEventTrackConfiguration](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/services/event-track/event-track.configuration.ts) can be found in the [event tracking documentation](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/analytics/src/services/event-track/event-track.configuration.ts)

#### First load measurement

This mark is populated by default by the __EventTrackService__ when the [NavigationEnd](https://angular.io/api/router/NavigationEnd) event of the router emits for the first time.

#### First paint (FP)

You can mark the time the loading is rendered.

* If the app has a loading indicator at [NavigationStart](https://angular.io/api/router/NavigationStart), this is when we want to mark the first paint.

```typescript
// app component
...
  constructor(private router: Router, public trackEventsService: EventTrackService) {}
  ngOnInit() {
    this.subscriptions.push(this.router.events.subscribe((event) => this.setLoadingIndicator(event)));
    ...
  }
  setLoadingIndicator(event: Event) {
    if (event instanceof NavigationStart) {
      this.loading = true;
      this.trackEventsService.markFP(); // ----> mark the first paint here
    }
  }
```

* If __index.html__ contains a loading indicator, it will be rendered even before loading angular;
In this case FP will be marked by the browser api. You can activate this behaviour in the tracking service and override the '_useBrowserApiForFirstFP_' config property to _true_;
If the browser does not have [performance entry 'paint' api](https://developer.mozilla.org/en-US/docs/Web/API/Performance/getEntriesByType), nothing will be marked.

```typescript
// in app module
  ...
  providers: [
    ...
    {provide: EVENT_TRACK_SERVICE_CONFIGURATION, useValue: {useBrowserApiForFirstFP: true}}
  ]
```

* __markFP__ method from tracking service should be called when the loading indicator is triggered

#### First Meaningful Paint (FMP)

You can mark FMP is in the _ngAfterViewInit_ of each page

```typescript
// Search component

constructor(... , private trackEventsService: EventTrackService) {...}

ngAfterViewInit() {
    this.trackEventsService.markFMP();
}
```

#### Data Ready

This will depend on your application.
For example, on the availability page, mark _data ready_ when the calendar and offers data are available;

```typescript
// upsell page component
...
export class UpsellComponent implements OnInit, OnDestroy, Configurable<UpsellConfig> {
  ...
  constructor(public trackEventsService: EventTrackService, private store: Store<AirOffersStore & AirSearchCriteriaStore & CartStore & AirCalendarStore>) {
    ...
  }

  ngOnInit() {
    const airCalendarReady$ = this.store.pipe(
        select(selectAirCalendarState),
        filter((state) => state.isPending === false && state.isFailure === false)
      );
    const airOffersReady$ = this.store.pipe(
      select(selectAirOffersIds),
      filter((ids) => !!ids.length)
    );
    this.subscriptions.push(
      combineLatest(airCalendarReady$, airOffersReady$)
        .pipe(take(1))
        .subscribe(([_airCalendar, _airOffersIds]) => {
          this.trackEventsService.markDataReady();  /// ----> mark data ready when both calendar and offres data are in the store
        }));
  }
  ...
}
```
