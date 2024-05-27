# Track UI Events

The main purpose of this mechanism is to ease event tracking at component level.
You can capture your events via the tracking event directives (exposed in the [TrackEventsModule](#trackeventsmodule))
and the [EventTrackService](#eventtrackservice).

You can access all these events via the [EventTrackService](#eventtrackservice).

## EventTrackService

This service is used to store the event objects and to expose them as a stream (observable) to your application.
It controls the analytics activation and deactivation as a whole or per feature (ui, performance etc.).

You can directly access the service `EventTrackService` inside your component to capture new events.

```typescript
import {EventTrackService} from '@o3r/analytics';
import {analyticsEvents, MyComponentAnalytics} from './my-component.analytics';

class MyComponent extends Trackable<MyComponentAnalytics>, ... {
  ...

  /**
   * @inheritDoc
   */
  public readonly analyticsEvents: MyComponentAnalytics = analyticsEvents;

  constructor(..., private eventTrackService: EventTrackService) {
    ...
  }

  ...

  somethingHappened() {
    this.eventTrackService.addUiEvent(new analyticsEvents.dummyEvent())
  }
}
```

## TrackEventsModule

The `TrackEventsModule` contains directives to help you track standard event such as the `TrackClickDirective` or
`TrackFocusDirective`.
You can track more standard ui event with the `TrackEventsDirective` and even create your own component events
(see [Analytics Events](./ANALYTICS.md)).
Note that all these events will be stored as UI Events in the [EventTrackService](#eventtrackservice).

```html
<button
  (click)="doSomething()"
  trackClick
  [trackEventContext]="analyticsEvents.dummyEvent()"></button>
<button
  (click)="doSomethingElse()"
  trackClick
  [trackEventContext]="analyticsEvents.runtimeDummyEvent('You could send runtime data here')"></button>
```

### TrackEvents directive

The directive will listen to the events on the element on which was applied and will expose the event captured using the track service.

| Input Name        | Description                                            | Possible Values                 |
| ----------------- | ------------------------------------------------------ | ------------------------------- |
| trackEvents       | List of events which have to be tracked                | ['mouseover', 'mouseenter']     |
| trackEventContext | Custom object to be exposed when the event is captured | {context: 'continueBtnClicked'} |

A specific directive for the click event was created, as it is the most used tracked event.

### Directive usage

```html
<button type="button" *ngFor="let calendarDate of calendarDates"
        [attr.selected]="isSelected"
        (click)="onDateSelection()"
        [trackEventContext]="{name: 'selectDate', dateSelected: calendarDate}"
        [trackEvents]="['click']"  <!-- or simply 'trackClick' -->
>
```

If the object passed in `trackEventContext` has to be updated in the model file (ts):

* it can be done calling a function (the drawback here is that a function is called too many times if it is used in the templates directly);
* it can be done on the event handler function if exists - you might need to call the detectChanges if a navigation occurs or the component is repainted, not recommended;
* it can be done via a pipe which will update the object - recommended solution as a pipe is pure by default meaning that if the inputs have not changed the transform will not be called;

```html
<form [formGroup]="searchForm">
  ...
  <button
    [trackEvents]="['click', 'mouseover']"
    [trackEventContext]="{value: eventModel | eventContext : {departure: searchForm.controls['departureLocation'], arrival: searchForm.controls['arrivalLocation']}}"
    [disabled]="!searchForm.valid"
    [attr.id]="id + '-searchButton'">Search</button>
  ...
</form>
```

in component.ts file

```typescript
eventModel = {name: 'searchBtnMouseEvent'};
```

in eventContext pipe.ts file

```typescript
transform(value: any, itinerary: any): any {
    return {...value, itinerary};
}
```

### Application level

At application level a subscription can be done to the observable emitted by the track events service.
You can enhance your analytics data and merge/concatenate/modify the event from the `TrackEventsService` with your own
application store.

