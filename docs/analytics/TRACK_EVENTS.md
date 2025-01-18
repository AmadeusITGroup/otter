# Track Analytics Events

The main purpose of this mechanism is to ease event tracking at component level.
You can capture your events via the tracking [event directives](#directives).

You can emit [Analytics Events](#event) directly via the [AnalyticsEventReporter](#analytics-event-reporter).
You can access all these events via the __events$__ stream exposed by [AnalyticsEventReporter](#analytics-event-reporter).

## Setup Analytics reporter

The `AnalyticsEventReporter` is the central service gathering and reporting the data to the different third party Analytics solution [registered](#register-analytics-services).

Per default, the Analytics service collects analytics data as soon as the `AnalyticsEventReporter` service is imported by the application (the different [event directives](#directives) are automatically importing the service).
If no third party Analytics services are registered, the `AnalyticsEventReporter` service keep a buffer of the emitted Analytics event until at least one Analytics service is registered. The size of this buffer is configurable via the [AnalyticsEventReporter's configuration](#analytics-event-reporter).

There are 2 ways to start manually the collect of the Analytics events:

__1. Via module load__

```typescript
// in main.ts file

import { AnalyticsTrackerModule } from '@o3r/analytics';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AnalyticsTrackerModule.forRoot({
        //... Configuration of the Analytics services
        trackerConfig: { activatedOnBootstrap: true }
      }),
    )
  ]
});

```

> [!NOTE]
> The option `activatedOnBootstrap` is at `true` per default, the explicit set of this property is not required.

__2. Via Token Injection__

```typescript
// in a component (or specially ion the AppComponent)

import {
  ANALYTICS_REPORTER_CONFIGURATION,
  ANALYTICS_TRACK_DIRECTIVES,
  AnalyticsEventReporter,
  defaultAnalyticsReporterConfiguration,
} from '@o3r/analytics';

@NgComponent({
  imports: [
    ANALYTICS_TRACK_DIRECTIVES
  ],
  providers: [
    {
      provide: ANALYTICS_REPORTER_CONFIGURATION,
      useFactory: () => ({
        ...defaultAnalyticsReporterConfiguration,
        activatedOnBootstrap: true
      })
    },
    AnalyticsEventReporter
  ]
})
class AppComponent {

}
```

__3. Via direct service import__

```typescript
// in a component

import { AnalyticsEventReporter  } from '@o3r/analytics';

@NgComponent(/* ... */)
class MyComponent {
  private analytics = inject(AnalyticsEventReporter);

  public toggleAnalytics() {
    this.analytics.isTrackingActive.set(!this.analytics.isTrackingActive());
  }
}
```

### Register Analytics Services

To report the captured analytics events, the `AnalyticsEventReporter` should know the different Analytics service to report the events too.

The Otter framework comes with implementation of interfaces to third party Analytics services, available via the [Analytics services list](#available-analytics-services), and also give the possibility to implement its [own Analytics service interface](#third-party-analytics-service).

The Analytics services can be registered in 2 different ways:

__1. At bootstrap time__ via the `AnalyticsTrackerModule` options (or the `ANALYTICS_REPORTER_CONFIGURATION` token injection)

```typescript
// in main.ts file

import { AnalyticsTrackerModule } from '@o3r/analytics';
import { createGoogleAnalyticsService } from '@o3r/analytics';

const gaInstance = createGoogleAnalyticsService({uuidL 'my-uuid'});

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AnalyticsTrackerModule.forRoot({
        //... Configuration of the Analytics services
        trackerConfig: {
          registeredAnalyticsServicesOnBootstrap: [
            gaInstance
          ]
        }
      }),
    )
  ]
});
```

__2. At run time__ via the usage of the `AnalyticsEventReporter` service

```typescript
// in a component

import { AnalyticsEventReporter } from '@o3r/analytics';
import { createGoogleAnalyticsService } from '@o3r/analytics';

@NgComponent(/* ... */)
class MyComponent {
  private analytics = inject(AnalyticsEventReporter);

  public addGoogleAnalytics() {
    const gaInstance = createGoogleAnalyticsService({uuidL 'my-uuid'});
    return this.registerAnalyticsServices(gaInstance);
  }
}
```

### Listen page change events

The `@o3r/analytics` package exposes a service dedicated to listen and report the Angular Router events called [AnalyticsRouterTracker](#analytics-router-service).

The service just need to be injected to run:

```typescript
// in main.ts file

import { AnalyticsRouterTracker } from '@o3r/analytics';

bootstrapApplication(AppComponent, {
  providers: [
    AnalyticsRouterTracker
  ]
});
```

or can be activated via the `AnalyticsTrackerModule` module

```typescript
// in main.ts file

import { AnalyticsTrackerModule } from '@o3r/analytics';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AnalyticsTrackerModule.forRoot({
        enableRouterTracker: true
      }),
    )
  ]
});

```

> [!NOTE]
> the `AnalyticsRouterTracker` is active only when the Analytics report is activated. It loads the `AnalyticsRouterTracker` service if it is not already loaded by the application.

## Event

To support multiple [Third party Analytics service](#third-party-analytics-service), the Otter framework defined a custom layer of events.
To simplify the implementation of event emitter, and the handle of these events by the Third party Analytics services, a set of interfaces are exposed for *wellknown* events:

- __AnalyticsClickEvent__: Click events
- __AnalyticsFocusEvent__: Focus events
- __AnalyticsPageViewEvent__: Route change events
- __AnalyticsExceptionEvent__: Exception (warning and error) events

To define a __Custom Event__ (not part of the previous list), the action should implement the `AnalyticsGenericEvent` which will enforce the __action name__ to be prefixed with `_`.

> [!WARNING]
> Per definition, the Custom Event does not have proper conversion to the [provided Third party adapters](#third-party-analytics-service). It may not be reported to certain services or to produce warnings.

## Tools

The `@o3r/analytics` comes with several tools to help to report analytics data based on the application final users actions on the UI.

### Directives

Today 3 different directives are exposed by `@o3r/analytics` to react on specific HTML events.
This directives come with dedicated attributes to specified the analytics event to emit.

#### Analytics Click directive

The directive is exposed as __standalone module__ under the name `AnalyticTrackClick` and should be imported by the component using it.

To be applied to an Element, the following attribute need to be provided:

- __trackClick__: Indicate that the click event should be listen. If a value is specified, it will be used as default event value in case `trackClickValue` is not specified.

The following attributes can be specified (not mandatory) to indicate additional information to the event:

- __trackClickCategory__: Indicate the __category__ of the reported event.
- __trackClickAction__: Indicate the __action name__ of the reported event. If not specified, the name *click* will be used.
- __trackClickLabel__: Indicate a __label__ to apply to the reported event.
- __trackClickValue__: Indicate a __value__ to the reported event. If not specified, the value indicated in the `trackClick` attribute will be used.

Usage example:

```html
<button value="got clicked" [trackClick]="{count: count++}" [trackClickCategory]="'useless-button'">
  Click Me
</button>
```

#### Analytics Focus directive

The directive is exposed as __standalone module__ under the name `AnalyticTrackFocus` and should be imported by the component using it.

To be applied to an Element, the following attribute need to be provided:

- __trackFocus__: Indicate that the focus event should be listen. If a value is specified, it will be used as default event value in case `trackFocusValue` is not specified.

The following attributes can be specified (not mandatory) to indicate additional information to the event:

- __trackFocusCategory__: Indicate the __category__ of the reported event.
- __trackFocusAction__: Indicate the __action name__ of the reported event. If not specified, the name *focus* will be used.
- __trackFocusLabel__: Indicate a __label__ to apply to the reported event.
- __trackFocusValue__: Indicate a __value__ to the reported event. If not specified, the value indicated in the `trackFocus` attribute will be used.

Usage example:

```html
<input type="text" value="" [trackFocus]="{count: count++}" [trackFocusCategory]="'user-input'" />
```

#### Analytics events directive

The directive is exposed as __standalone module__ under the name `AnalyticTrackEvent` and should be imported by the component using it.

To be applied to an Element, the following attribute need to be provided:

- __trackEvents__: Indicate that the Dom event(s) that should be listen.

The following attributes can be specified (not mandatory) to indicate additional information to the event:

- __trackCategory__: Indicate the __category__ of the reported event(s).
- __trackAction__: Indicate the __action name__ of the reported event. If not specified, the name of the event will be used.
- __trackLabel__: Indicate a __label__ to apply to the reported event(s).
- __trackValue__: Indicate a __value__ to the reported event(s). If not specified, the value of the element will be used.

Usage example (multi events):

```html
<button value="button" [trackEvents]="['keyPress', 'blur']" [trackCategory]="'category'">
  click me
</button>
```

Usage example (single event):

```html
<button value="button" [trackEvents]="'keyPress'" [trackCategory]="'category'">
  click me
</button>
```

> [!NOTE]
> To apply different *category*, *value* or *action* per events, the dedicated directives should be applied together.

Multi directive example:

```html
<button value="button" [trackClick]="'you clicked me'" [trackClickCategory]="'clicks'" [trackFocus]="'you focused me'" [trackFocusCategory]="'focuses'">
  click me
</button>
```

> [!IMPORTANT]
> The directives need to be imported by the component using them. It can be all imported at once thanks to `ANALYTICS_TRACK_DIRECTIVES`.

### Analytics event reporter

The service `AnalyticsEventReporter` is loaded in root (as singleton) to report the analytics events to the registered Analytics services.
It exposes only 2 functions:

- __registerAnalyticsServices__: to register third party Analytics service(s) during the application life.
- __reportEvent__: report manually an [analytics event](#event) to be dispatched to the registered third party Analytics service(s).

The `AnalyticsEventReporter` service can be configured via the `ANALYTICS_REPORTER_CONFIGURATION` (see [Track Analytics Events](#track-analytics-events)) with the following options:

- __eventStackSize__: size of the event stack to keep when no Analytics service registered.
- __activatedOnBootstrap__: determine if the service is collecting analytics on the load of the service.
- __registeredAnalyticsServicesOnBootstrap__: list of Analytics services to register on bootstrap of the service.

### Analytics Logger

The package `@o3r/analytics` exposes the [logger](../logger/LOGS.md) __AnalyticsExceptionLogger__ (to [register to the `LoggerService`](../logger/LOGS.md#setup)) to report the __warnings__ and __errors__ via the `AnalyticsEventReporter`.

### Analytics Router Service

To automatically report the routing changes to the Analytics services, the `@o3r/analytics` exposes the __AnalyticsRouterTracker__ service, provided in root, that can manually provided or loaded thanks to the [AnalyticsTrackerModule](#setup-analytics-reporter).

## Available Analytics Services

To be able to be registered as to the [Reporter Analytics service](#analytics-event-reporter), the Third party Analytics services need to implement the [Analytics interface](#third-party-analytics-service).
The `@o3r/analytics` already expose a set of factory function returning the adapters to Third party services:

| Analytics Service | Factory function               | Parameters                                     |
| ----------------- | ------------------------------ | ---------------------------------------------- |
| Google Analytics  | `createGoogleAnalyticsService` | - __uuid__: ID of the Google Analytics account |

## Third Party Analytics service

A Third Party service adapter should implement the `AnalyticsThirdPartyService` which enforce the exposition of the __emit__ and allow the following hooks:

- __onRegistration__: Hook called when the services has been registered to the `AnalyticsEventReporter`.
- __onActivation__: Hook called when the the `AnalyticsEventReporter` ios deactivated.
- __onDeactivation__: Hook called by the `AnalyticsEventReporter` to emit an Analytics Event to the service implemented this interface.
