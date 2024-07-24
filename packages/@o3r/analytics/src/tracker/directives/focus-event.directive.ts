import { Directive, input } from '@angular/core';
import { AnalyticTrackGeneric } from './generic-event.directive';

@Directive({
  selector: '[trackFocus]',
  standalone: true
})
/** Directive to listen and emit analytics in case of Dom Focus event */
export class AnalyticTrackFocus extends AnalyticTrackGeneric {
  /** @inheritdoc */
  public trackEvent = input(undefined, { alias: 'trackFocus' });
  /** @inheritdoc */
  public trackCategory = input('', { alias: 'trackFocusCategory' });
  /** @inheritdoc */
  public trackAction = input(undefined, { alias: 'trackFocusAction' });
  /** @inheritdoc */
  public trackLabel = input(undefined, { alias: 'trackFocusLabel' });
  /** @inheritdoc */
  public trackValue = input(undefined, { alias: 'trackFocusValue' });
  /** @inheritdoc */
  public readonly eventName = 'focus';
}
