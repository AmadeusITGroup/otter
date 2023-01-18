import {Directive, ElementRef, Renderer2} from '@angular/core';
import {Subscription} from 'rxjs';

import {
  AnalyticsEvent,
  ConstructorAnalyticsEvent,
  ConstructorAnalyticsEventParameters,
  EventContext,
  TrackEventName
} from '../../contracts';
import {EventTrackService} from '../../services/event-track';

@Directive()
export abstract class BaseTrackEvents {
  /**
   * Custom object to be stored when the click event is captured
   */
  public abstract trackEventContext?: EventContext;

  /**
   * Class to create the EventContext
   */
  public abstract trackEventContextConstructor?: ConstructorAnalyticsEvent<AnalyticsEvent>;

  /**
   * Parameter that should be given to the
   */
  public abstract trackEventContextConstructorParameters?: ConstructorAnalyticsEventParameters;

  /**
   * Store the functions returned by the angular renderer when an event listener is built
   * The functions can be called to destroy the associated listeners
   */
  protected unlistenFns: (() => void)[] = [];

  /** Array of track events objects */
  protected trackingEvents: TrackEventName[] = [];

  /** Flag for the tracking mode */
  protected isTrackingActive = false;

  /** Tracking mode subscription */
  private subscription: Subscription;

  protected constructor(protected el: ElementRef, protected trackEventsService: EventTrackService, protected renderer: Renderer2) {
    this.subscription = this.trackEventsService.uiTrackingActive$.subscribe((isActive) => {
      this.isTrackingActive = isActive;
      if (isActive) {
        this.listen();
      } else {
        this.unlisten();
      }
    });
  }

  /**
   * Create the listener for the given event
   *
   * @param event name
   */
  protected nativeListen(event: TrackEventName) {
    // Renderer is used because it is manipulating the DOM and when the element is destroyed the event listener is destroyed too.
    // Usage of an observable from event was not possible because the ngOnDestroy with the unsubscribe was called before the ui event was handled
    return this.renderer.listen(this.el.nativeElement, event, (nativeEvent) => {
      if (this.trackEventContextConstructor) {
        // eslint-disable-next-line new-cap
        this.trackEventsService.addUiEvent({nativeEvent, context: new this.trackEventContextConstructor(this.trackEventContextConstructorParameters)});
      } else if (this.trackEventContext) {
        this.trackEventsService.addUiEvent({nativeEvent, context: this.trackEventContext});
      }
    });
  }

  /** Create the events listeners */
  public listen() {
    this.unlisten();
    this.unlistenFns = this.trackingEvents.map((event) => this.nativeListen(event));
  }

  /** Remove the created events listeners */
  public unlisten() {
    this.unlistenFns.forEach((fn) => fn());
    this.unlistenFns = [];
  }

  /**
   * Keep the events to be listen and create the listener event for the given event name
   *
   * @param event name
   */
  public trackEvent(event: TrackEventName) {
    this.trackingEvents.push(event);
    if (this.isTrackingActive) {
      this.unlistenFns.push(this.nativeListen(event));
    }
  }

  /** Unsubscribe from the activate tracking subscription */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
