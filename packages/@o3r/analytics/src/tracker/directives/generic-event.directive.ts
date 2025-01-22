import {
  Directive,
  effect,
  ElementRef,
  inject,
  type OnInit,
  Renderer2,
  type Signal,
} from '@angular/core';
import type {
  AnalyticsWellKnownDomActionType,
} from '../events';
import {
  AnalyticsEventReporter,
} from '../services/tracker/analytics-reporter.service';

type TrackEventName = keyof GlobalEventHandlersEventMap;

@Directive()
/** Generic abstract directive to report Analytics specific UI event */
export abstract class AnalyticTrackGeneric implements OnInit {
  /** Value of the event to if no {@link trackValue} is specified */
  public abstract trackEvent: Signal<any>;
  /** Category of the event */
  public abstract trackCategory: Signal<string>;
  /**
   * Name of the action as defined in analytics service.
   * The name of the Dom Event will be used if not specified.
   */
  public abstract trackAction: Signal<AnalyticsWellKnownDomActionType | undefined>;
  /** Label of the event */
  public abstract trackLabel: Signal<string | undefined>;
  /** Value of the event */
  public abstract trackValue: Signal<any>;

  /** Name of the Dom Event listen by the directive */
  public abstract readonly eventName: TrackEventName;

  protected readonly el = inject(ElementRef);
  protected readonly trackEventsService = inject(AnalyticsEventReporter);
  protected readonly renderer = inject(Renderer2);
  protected readonly isTrackingActive;
  protected listeningEvent?: () => void;

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
        attributes: this.trackValue() || this.trackEvent() || this.el.nativeElement?.value
      });
    });
  }

  /** Remove the created events listeners */
  protected unlisten() {
    this.listeningEvent?.();
    this.listeningEvent = undefined;
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    effect(() => {
      if (this.isTrackingActive()) {
        this.listeningEvent = this.nativeListen(this.eventName);
      } else {
        this.unlisten();
      }
    });
  }
}
