import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

import {
  AnalyticsEvent,
  ConstructorAnalyticsEvent,
  ConstructorAnalyticsEventParameters,
  EventContext
} from '../../../contracts/index';
import {EventTrackService} from '../../../services/event-track/event-track.service';
import {BaseTrackEvents} from '../base-track-events';

/**
 * Directive to capture the 'click' event on the reference element.
 * The captured event will be exposed via EventTrackService
 * @example
 * ```html
 * <my-component
 *    (click)="doSomething()"
 *    trackClick
 *    [trackEventContext]="{context: 'click on the component with tag: my-component'}">
 * </my-component>
 * ```
 */
@Directive({
  selector: '[trackClick]'
})
export class TrackClickDirective extends BaseTrackEvents implements OnInit {
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

  constructor(el: ElementRef, trackEventsService: EventTrackService, renderer: Renderer2) {
    super(el, trackEventsService, renderer);
  }

  public ngOnInit() {
    this.trackEvent('click');
    this.trackEvent('contextmenu');
    this.trackEvent('auxclick');
  }
}
