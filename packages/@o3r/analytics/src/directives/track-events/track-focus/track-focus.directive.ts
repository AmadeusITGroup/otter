import {
  Directive,
  Input,
  OnInit,
} from '@angular/core';
import {
  AnalyticsEvent,
  ConstructorAnalyticsEvent,
  ConstructorAnalyticsEventParameters,
  EventContext,
} from '../../../contracts/index';
import {
  BaseTrackEvents,
} from '../base-track-events';

/**
 * Directive to capture the 'focus' event on the reference element.
 * The captured event will be exposed via EventTrackService
 * @example
 * ```html
 * <my-component
 *    trackFocus
 *    [trackEventContext]="{context: 'focus on the component with tag: my-component'}">
 * </my-component>
 * ```
 */
@Directive({
  selector: '[trackFocus]'
})
export class TrackFocusDirective extends BaseTrackEvents implements OnInit {
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

  public ngOnInit() {
    this.trackEvent('focus');
  }
}
