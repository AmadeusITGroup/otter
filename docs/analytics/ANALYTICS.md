# Analytics
Here, you will see how to build step by step your own component UI events to be tracked by the [Analytics Track Event Service](./TRACK_EVENTS.md).

## Context
The practice of analytics is there for supporting decision-making by providing the relevant facts that will allow you to make better choices.

## How to use
When you generate your component, you can decide to activate the otter analytics structure.

### A new file analytic.ts
The otter component generator will create one file suffixed by `analytics.ts`. 
Inside you will find an interface to define all the events that your component can trigger and a const to inject inside your component.

```typescript
import {utils} from '@ama-sdk/core';
import type {AnalyticsEvents, Attribute, EventInfo} from '@o3r/analytics';

class DummyEvent implements AnalyticsEvent {
  public eventInfo: EventInfo
  constructor (pageId: string) {
    this.eventInfo = {
      eventName: 'DummyEvent',
      timeStamp: (new utils.Date()).getTime(),
      pageId
    }
  }
}

class RuntimeDummyEvent implements AnalyticsEvent {
  public eventInfo: EventInfo;
  public attributes: Attribute[]

  constructor(pageId: string, runtimedata: any) {
    this.attributes = [{key: 'runtimedata', value: runtimedata}]
    this.eventInfo = {
      eventName: 'DummyEvent',
      timeStamp: (new utils.Date()).getTime(),
      pageId
    }
  }
}

export interface MyComponentAnalytics extends AnalyticsEvents {<
  dummyEvent: DummyEvent;
  runtimeDummyEvent: AnalyticsEvent;
}

export const analyticsEvents: MyComponentAnalytics = {
  dummyEvent: DummyEvent,
  runtimeDummyEvent: RuntimeDummyEvent
};
```

### Component file
Your component needs to implement _Trackable_ interface.

```typescript
...
import {analyticsEvents, MyComponentAnalytics} from './my-component.analytics';

class MyComponent implements Trackable<MyComponentAnalytics>, ... {
  ...

  /**
   * @inheritDoc
   */
  public readonly analyticsEvents: MyComponentAnalytics = analyticsEvents;

  ...
}
```

## TrackEvents

Check [TRACK_EVENTS.md](./TRACK_EVENTS.md)
