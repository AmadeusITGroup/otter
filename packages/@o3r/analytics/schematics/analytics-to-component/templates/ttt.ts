import type { EventInfo, AnalyticsEvent, Attribute, ConstructorAnalyticsEvent, ConstructorAnalyticsEventParameters, AnalyticsEvents} from '@o3r/analytics';

const dummyEvent = () => {
  
}

  /**
   * Dummy event to show how we can use analytics event
   */
  export class DummyEvent implements AnalyticsEvent {
    /** @inheritdoc */
    public eventInfo: EventInfo = {
      eventName: 'DummyEvent'
    };
  }

  /**
   * Interface to define the inputs that RuntimeDummyEvent needs to be created
   */
  export interface RuntimeDummyEventConstructorAnalyticsEventParameters extends ConstructorAnalyticsEventParameters {
    /**
     * Example of runtime data
     */
    runtimeData?: string;
  }

  /**
   * Dummy event with runtime data to show how we can use analytics event
   */
  export class RuntimeDummyEvent implements AnalyticsEvent {
    /** @inheritdoc */
    public eventInfo: EventInfo = {
      eventName: 'RuntimeDummyEvent'
    };

    /** @inheritdoc */
    public attributes: Attribute[]

    constructor(parameters?: RuntimeDummyEventConstructorAnalyticsEventParameters) {
      this.attributes = parameters?.runtimeData ? [{ key: 'runtimeData', value: parameters.runtimeData }] : [];
    }
  }

/**
 * Interface for the analytics of <%= componentName %>
 */
export interface ComponentAnalytics extends AnalyticsEvents {
    dummyEvent: ConstructorAnalyticsEvent<DummyEvent>;
    runtimeDummyEvent: ConstructorAnalyticsEvent<RuntimeDummyEvent>;
}

/**
 * Definition of the analytics of <%= componentName %>
 */
export const analyticsEvents: ComponentAnalytics = {
    dummyEvent: DummyEvent,
    runtimeDummyEvent: RuntimeDummyEvent
};
