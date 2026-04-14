import {
  Directive,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  AnalyticsEvent,
  ConstructorAnalyticsEvent,
  ConstructorAnalyticsEventParameters,
  EventContext,
  TrackEventName,
} from '../../contracts';
import {
  BaseTrackEvents,
} from './base-track-events';

/**
 * Directive to capture the events given as input, on the reference element.
 * The captured event will be exposed via EventTrackService
 * @example
 * ```html
 * <my-component
 *    (click)="doSomething()"
 *    [trackEvents]="['mouseenter', 'mouseleave']"
 *    [trackEventContext]="{context: 'click on the component with tag: my-component'}">
 * </my-component>
 * ```
 */
@Directive({
  selector: '[trackEvents]'
})
export class TrackEventsDirective extends BaseTrackEvents implements OnChanges {
  /**
   * @inheritdoc
   */
  @Input() public trackEventContext?: EventContext;

  /**
   * @inheritdoc
   */
  @Input() public trackEventContextConstructor?: ConstructorAnalyticsEvent<AnalyticsEvent>;

  /**
   * @inheritdoc
   */
  @Input() public trackEventContextConstructorParameters?: ConstructorAnalyticsEventParameters;

  /** The list of events to listen */
  @Input('trackEvents') public trackEventNames: TrackEventName[] = [];

  public ngOnChanges(changes: SimpleChanges) {
    if ('trackEventNames' in changes) {
      this.trackingEvents = [];
      this.unlisten();
      this.trackEventNames.forEach((eventName) => this.trackEvent(eventName));
    }
  }
}
