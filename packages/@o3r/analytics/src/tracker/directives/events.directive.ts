import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  type OnInit,
  Renderer2,
} from '@angular/core';
import type {
  AnalyticsWellKnownDomActionType,
} from '../events';
import {
  AnalyticsEventReporter,
} from '../services/tracker/analytics-reporter.service';

type TrackEventName = keyof GlobalEventHandlersEventMap;

/**
 * Directive to track one or several Dom Events
 * @example Multi events
 * ```html
 * <button value="button" [trackEvents]="['keyPress', 'blur']" [trackCategory]="'category'">
 *   click me
 * </button>
 * ```
 * @example Single event
 * ```html
 * <button value="button" [trackEvents]="'keyPress'" [trackCategory]="'category'">
 *   click me
 * </button>
 * ```
 */
@Directive({
  selector: '[trackEvents]',
  standalone: true
})
export class AnalyticTrackEvent implements OnInit {
  /** List the Dom Element events to listen and for which emitting analytics event. */
  public trackEvents = input.required<TrackEventName[]>();
  /** Category of the events */
  public trackCategory = input<string>('');
  /**
   * Name of the action as defined in analytics service.
   * The name of the Dom Event will be used if not specified.
   */
  public trackAction = input<AnalyticsWellKnownDomActionType | undefined>();
  /** Label of the events */
  public trackLabel = input<string | undefined>();
  /** Value of the events */
  public trackValue = input<any>();

  protected readonly el = inject(ElementRef);
  protected readonly trackEventsService = inject(AnalyticsEventReporter);
  protected readonly renderer = inject(Renderer2);
  protected readonly isTrackingActive;
  protected listeningEvents: { [x in TrackEventName]?: () => void } = {};

  constructor() {
    this.isTrackingActive = this.trackEventsService.isTrackingActive;
  }

  /**
   * Create the listener for the given event
   * @param eventName name of the event to listen
   */
  protected nativeListen(eventName: TrackEventName) {
    // Renderer is used because it is manipulating the DOM and when the element is destroyed the event listener is destroyed too.
    // Usage of an observable from event was not possible because the ngOnDestroy with the unsubscribe was called before the ui event was handled
    return this.renderer.listen(this.el.nativeElement, eventName, (event) => {
      const action = this.trackAction() || eventName as AnalyticsWellKnownDomActionType;
      this.trackEventsService.reportEvent({
        type: 'event',
        action,
        category: this.trackCategory(),
        label: this.trackLabel(),
        event,
        attributes: this.trackValue() || this.el.nativeElement?.value
      });
    });
  }

  /** Remove the created events listeners */
  protected unlisten() {
    Object.values(this.listeningEvents).forEach((fn) => fn);
    this.listeningEvents = {};
  }

  public ngOnInit(): void {
    effect(() => {
      const analyticEvent = this.trackEvents();
      if (this.isTrackingActive()) {
        this.listeningEvents = {
          ...this.listeningEvents,
          ...Object.fromEntries(analyticEvent
            .filter((e) => !this.listeningEvents[e])
            .map((e) => [e, this.nativeListen(e)])
          )
        };
      }
    });

    effect(() => {
      if (!this.isTrackingActive()) {
        this.unlisten();
      }
    });
  }
}
